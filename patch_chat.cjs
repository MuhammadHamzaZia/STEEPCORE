const fs = require('fs');
const file = '/app/applet/STEEPCOREAPI/Modules/AiEngine/Controllers/AiChatController.cs';
let code = fs.readFileSync(file, 'utf8');

// Change model to 1.5-pro
code = code.replace(/gemini-3\.5-flash/g, 'gemini-1.5-pro');

// Deep research instructions for Node Expansions
const oldExpansionSwitch = `        var promptInstruction = req.ExpansionType switch {
            "detailed" => "Please generate a detailed hierarchical structure (phases -> topics -> concepts/courses) branching from this node. Return it as 'phases' array.",
            "tools" => "Please generate a list of essential tools, frameworks, or software required for this node. Return it as 'newNodes' array.",
            "projects" => "Please generate a list of practical project ideas to master the skills in this node. Return it as 'newNodes' array.",
            "resources" => "Please generate a list of recommended learning resources (books, courses, docs) for this node. Return it as 'newNodes' array.",
            "interview" => "Please generate a list of common interview questions or topics related to this node. Return it as 'newNodes' array.",
            _ => "Please generate a flat list of sub-topics or concepts for this specific node. Return it as 'newNodes' array."
        };`;

const newExpansionSwitch = `        var promptInstruction = req.ExpansionType switch {
            "detailed" => "Provide an EXHAUSTIVE, university-grade deep dive. Break this topic into foundational concepts, advanced mechanisms, and expert-level nuances. Return a massive, highly researched 'phases' array containing rich descriptions.",
            "tools" => "List the absolute industry-standard tools, frameworks, and hidden enterprise software used by Senior Engineers for this topic. Explain WHY they are used. Return it as a highly detailed 'newNodes' array.",
            "projects" => "Generate highly complex, resume-worthy project ideas that solve real-world problems. Skip simple 'todo apps'. Return architecture requirements and learning outcomes for each project as a 'newNodes' array.",
            "resources" => "List the absolute best learning resources available globally: definitive textbooks, official documentation, whitepapers, and top-tier courses. Return it as a 'newNodes' array.",
            "interview" => "Generate the most difficult, system-design and theoretical interview questions asked by FAANG-level companies regarding this topic. Include the expected expert answers. Return it as a 'newNodes' array.",
            _ => "Provide a highly technical and completely comprehensive breakdown of this topic into exhaustive sub-topics. Return it as a 'newNodes' array."
        };`;

code = code.replace(oldExpansionSwitch, newExpansionSwitch);

const oldPrompt = `        var prompt = $@"The user wants to expand on a specific node in their learning roadmap.
        Node Label: {req.NodeLabel}
        Node Type: {req.NodeType}
        User Request: {req.PromptContext}
        Expansion Level: {req.ExpansionType}
        {promptInstruction}";`;

const newPrompt = `        var prompt = $@"You are a Senior Principal Architect and elite Curriculum Designer. The user wants to expand on a specific node in their learning roadmap.
        Node Label: {req.NodeLabel}
        Node Type: {req.NodeType}
        User Request: {req.PromptContext}
        Expansion Level: {req.ExpansionType}
        
        INSTRUCTION: {promptInstruction}
        
        IMPORTANT: Your output MUST be highly researched, extremely long and detailed, and perfectly accurate. 
        Format your response EXCLUSIVELY as a JSON object matching the requested array key ('phases' or 'newNodes'). Ensure the JSON contains deeply rich text fields.";`;

code = code.replace(oldPrompt, newPrompt);

fs.writeFileSync(file, code);
