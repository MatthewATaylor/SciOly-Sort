function escapeHTML(str: string): string {
    var map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
    };
    return str.replace(/[&<>"'"]/g, function(char) { return map[char]; });
}
