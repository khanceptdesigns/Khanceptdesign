// === CONFIG ===
const GITHUB_USERNAME = "KhanceptDesigns";
const REPO_NAME = "Khanceptdesign";
const FILE_PATH = "products.json";

// You will paste your GitHub Token inside this variable (KEEP IT SECRET)
const GITHUB_TOKEN = "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";

// === LOAD PRODUCTS FROM GITHUB ===
async function loadProducts() {
    const url = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/main/${FILE_PATH}`;
    const response = await fetch(url);
    return response.json();
}

// === SAVE PRODUCTS TO GITHUB ===
async function saveProducts(updatedProducts) {

    // 1. Get current file SHA (GitHub requires this)
    const fileInfoRes = await fetch(
        `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`
    );
    const fileInfo = await fileInfoRes.json();

    // 2. Update file content
    const updateRes = await fetch(
        `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`,
        {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${GITHUB_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: "Updated product list",
                content: btoa(unescape(encodeURIComponent(JSON.stringify(updatedProducts, null, 2)))),
                sha: fileInfo.sha
            }),
        }
    );

    return updateRes.json();
}

// === ADD PRODUCT ===
async function addProduct(product) {
    let products = await loadProducts();
    products.push(product);
    await saveProducts(products);
    alert("Product added and saved to GitHub!");
}

// === DELETE PRODUCT ===
async function deleteProduct(id) {
    let products = await loadProducts();
    products = products.filter(p => p.id !== id);
    await saveProducts(products);
    alert("Product deleted!");
}

// === UPDATE PRODUCT ===
async function updateProduct(id, newData) {
    let products = await loadProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return alert("Product not found!");

    products[index] = { ...products[index], ...newData };
    await saveProducts(products);
    alert("Product updated!");
}
