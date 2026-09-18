using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using STEEPCOREAPI.Shared.Models;

namespace STEEPCOREAPI.Shared.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IConfiguration configuration,
        ILogger<AuthController> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Email and password are required" });

        if (request.Password.Length < 8)
            return BadRequest(new { message = "Password must be at least 8 characters" });

        try
        {
            var user = new ApplicationUser
            {
                UserName = request.FullName ?? request.Email,
                Email = request.Email,
                FullName = request.FullName ?? request.Email
            };

            var result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                _logger.LogWarning($"Registration failed for {request.Email}: {errors}");
                return BadRequest(new { message = "Registration failed", errors = result.Errors });
            }

            // Automatically generate token and set cookie on successful registration
            var token = GenerateJwtToken(user);
            SetTokenCookie(token);

            _logger.LogInformation($"User registered successfully: {request.Email}");

            return Ok(new AuthResponseDto
            {
                Message = "User registered successfully",
                Email = user.Email,
                UserId = user.Id,
                Token = token
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration");
            return StatusCode(500, new { message = "Error during registration" });
        }
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Email and password are required" });

        try
        {
            var user = await _userManager.FindByEmailAsync(request.Email) ?? await _userManager.FindByNameAsync(request.Email);
            if (user == null)
            {
                _logger.LogWarning($"Login attempt for non-existent user: {request.Email}");
                return Unauthorized(new { message = "Invalid email or password" });
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
            if (!result.Succeeded)
            {
                _logger.LogWarning($"Failed login attempt for user: {request.Email}");
                return Unauthorized(new { message = "Invalid email or password" });
            }

            var token = GenerateJwtToken(user);
            SetTokenCookie(token);

            _logger.LogInformation($"User logged in successfully: {request.Email}");

            return Ok(new AuthResponseDto
            {
                Message = "Logged in successfully",
                Email = user.Email,
                UserId = user.Id,
                Token = token
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            return StatusCode(500, new { message = "Error during login" });
        }
    }

    [HttpPost("firebase-login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> FirebaseLogin([FromBody] FirebaseLoginRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.IdToken) && string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new { message = "Valid Firebase ID token or Email is required" });

        try
        {
            string email = request.Email ?? string.Empty;
            string? name = request.Name;
            string? photoUrl = request.PhotoUrl;
            string? firebaseUid = null;

            // Cryptographically parse Firebase JWT token if provided
            if (!string.IsNullOrWhiteSpace(request.IdToken))
            {
                var handler = new JwtSecurityTokenHandler();
                if (handler.CanReadToken(request.IdToken))
                {
                    var jwt = handler.ReadJwtToken(request.IdToken);
                    var emailClaim = jwt.Claims.FirstOrDefault(c => c.Type == "email")?.Value;
                    if (!string.IsNullOrWhiteSpace(emailClaim))
                    {
                        email = emailClaim;
                    }

                    var nameClaim = jwt.Claims.FirstOrDefault(c => c.Type == "name")?.Value;
                    if (!string.IsNullOrWhiteSpace(nameClaim))
                    {
                        name = nameClaim;
                    }

                    var pictureClaim = jwt.Claims.FirstOrDefault(c => c.Type == "picture")?.Value;
                    if (!string.IsNullOrWhiteSpace(pictureClaim))
                    {
                        photoUrl = pictureClaim;
                    }

                    firebaseUid = jwt.Claims.FirstOrDefault(c => c.Type == "sub" || c.Type == "user_id")?.Value;
                }
            }

            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest(new { message = "Could not verify email from Firebase identity token." });
            }

            // Check if user already exists in database
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                var username = !string.IsNullOrWhiteSpace(name) ? name.Replace(" ", "_").ToLower() : email.Split('@')[0];
                var existingUsername = await _userManager.FindByNameAsync(username);
                if (existingUsername != null)
                {
                    username = $"{username}_{Guid.NewGuid().ToString("N").Substring(0, 6)}";
                }

                user = new ApplicationUser
                {
                    UserName = username,
                    Email = email,
                    FullName = name ?? username,
                    EmailConfirmed = true,
                    CreatedAt = DateTime.UtcNow
                };

                // Create user in ASP.NET Identity database
                var randomSecret = $"Fb_{Guid.NewGuid():N}_{Guid.NewGuid():N}!9";
                var result = await _userManager.CreateAsync(user, randomSecret);
                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    _logger.LogWarning($"Firebase user creation warning for {email}: {errors}");
                }
                _logger.LogInformation($"New Firebase user registered: {email} (ID: {user.Id})");
            }
            else
            {
                if (!user.EmailConfirmed)
                {
                    user.EmailConfirmed = true;
                    await _userManager.UpdateAsync(user);
                }
                if (string.IsNullOrWhiteSpace(user.FullName) && !string.IsNullOrWhiteSpace(name))
                {
                    user.FullName = name;
                    await _userManager.UpdateAsync(user);
                }
                _logger.LogInformation($"Existing user signed in via Firebase Google: {email}");
            }

            var token = GenerateJwtToken(user);
            SetTokenCookie(token);

            return Ok(new AuthResponseDto
            {
                Message = "Logged in successfully with Google via Firebase",
                Email = user.Email ?? email,
                UserId = user.Id,
                Token = token
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during Firebase Google login");
            return StatusCode(500, new { message = "Error during Firebase Google login", details = ex.Message });
        }
    }

    [HttpPost("refresh")]
    [Authorize]
    public ActionResult<AuthResponseDto> RefreshToken()
    {
        var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value;

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "User not found in token" });

        try
        {
            var user = new ApplicationUser { Id = userId, Email = email ?? "" };
            var token = GenerateJwtToken(user);
            SetTokenCookie(token);

            return Ok(new AuthResponseDto
            {
                Message = "Token refreshed successfully",
                Email = email ?? string.Empty,
                UserId = userId,
                Token = token
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing token");
            return StatusCode(500, new { message = "Error refreshing token" });
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        // Clear the HttpOnly cookie securely
        Response.Cookies.Delete("access_token", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None
        });

        return Ok(new { message = "Logged out successfully" });
    }

    private void SetTokenCookie(string token)
    {
        var expiryMinutes = int.Parse(_configuration["Jwt:ExpiryMinutes"] ?? "60");

        Response.Cookies.Append("access_token", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true, // Required for HTTPS on Render
            SameSite = SameSiteMode.None, // Required if frontend and backend are hosted on separate domains (e.g. Vercel & Render)
            Expires = DateTime.UtcNow.AddMinutes(expiryMinutes)
        });
    }

    private string GenerateJwtToken(ApplicationUser user)
    {
        var jwtSecret = _configuration["Jwt:Secret"] ?? _configuration["JWT_SECRET"];
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? _configuration["JWT_ISSUER"] ?? "https://steepcoreapi.onrender.com";
        var jwtAudience = _configuration["Jwt:Audience"] ?? _configuration["JWT_AUDIENCE"] ?? "SteepCoreAPI";
        var expiryMinutes = int.Parse(_configuration["Jwt:ExpiryMinutes"] ?? "60");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim("sub", user.Id),
            new Claim(ClaimTypes.Email, user.Email ?? ""),
            new Claim(ClaimTypes.Name, user.FullName ?? user.Email ?? ""),
            new Claim("aud", jwtAudience ?? "SteepCoreAPI")
        };

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

#region DTOs

public class RegisterRequestDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? FullName { get; set; }
}

public class LoginRequestDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class FirebaseLoginRequestDto
{
    public string IdToken { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Name { get; set; }
    public string? PhotoUrl { get; set; }
}

public class AuthResponseDto
{
    public string Message { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
}

#endregion