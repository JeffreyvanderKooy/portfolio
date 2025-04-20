module.exports = json =>
  json
    // Remove markdown markers for code block
    .replace(/```json|```/g, '')
    // Trim any unnecessary spaces
    .trim();
