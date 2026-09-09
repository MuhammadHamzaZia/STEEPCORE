const errData = {
  "message": "Registration failed",
  "errors": [
    {
      "code": "DuplicateUserName",
      "description": "Username 'test2@test.com' is already taken."
    },
    {
      "code": "DuplicateEmail",
      "description": "Email 'test2@test.com' is already taken."
    }
  ]
};

let msg = '';
if (errData.errors && typeof errData.errors === 'object') {
    if (Array.isArray(errData.errors) && errData.errors.length > 0 && typeof errData.errors[0] === 'object') {
        // Identity errors
        msg = errData.errors.map(e => e.description || JSON.stringify(e)).join(', ');
    } else {
        // Standard ModelState errors (e.g. { "Email": ["Required"] })
        msg = Object.values(errData.errors).flat().join(', ');
    }
}
console.log(msg);
