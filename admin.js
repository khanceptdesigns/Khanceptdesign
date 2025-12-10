const GITHUB_USERNAME = "KhanceptDesigns";
const REPO_NAME = "Khanceptdesign";
const FILE_PATH = "products.json";

// IMPORTANT — add your PAT here
const GITHUB_TOKEN = "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";

// Load products
async function loadProducts() {
    try {
        const res = await fetch(
            `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/main/${FILE_PATH}`
        );
        if (!res.ok) throw new Error("Failed to load products");
        return await res.json();
    } catch (err) {
        alert("Error loading products: " + err.message);
        return [];
    }
}

// Save products
async function saveProducts(products) {
    try {
        const fileInfoRes = await fetch(
            `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`
        );
        const fileInfo = await fileInfoRes.json();

        const updateRes = await fetch(
            `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`,
            {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${GITHUB_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: "Updated products",
                    content: btoa(unescape(encodeURIComponent(JSON.stringify(products, null, 2)))),
                    sha: fileInfo.sha
                })
            }
        );

        if (!updateRes.ok) throw new Error("GitHub rejected the save request");

        return await updateRes.json();
    } catch (err) {
        alert("Error saving products: " + err.message);
    }
}
