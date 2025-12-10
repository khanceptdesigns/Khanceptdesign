// === CONFIG ===
const GITHUB_USERNAME = "KhanceptDesigns";
const REPO_NAME = "Khanceptdesign";
const FILE_PATH = "products.json";
const GITHUB_TOKEN = "YOUR-TOKEN-HERE"; // Replace with your token

// === LOAD PRODUCTS FROM GITHUB ===
async function loadProducts() {
    try {
        const url = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/main/${FILE_PATH}`;
        const response = await fetch(url);
        if(!response.ok) throw new Error("Failed to load products from GitHub");
        return await response.json();
    } catch (err) {
        console.error(err);
        alert("Error loading products: " + err.message);
        return [];
    }
}

// === SAVE PRODUCTS TO GITHUB ===
async function saveProducts(updatedProducts) {
    try {
        const fileInfoRes = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`);
        const fileInfo = await fileInfoRes.json();
        const updateRes = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`, {
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
        });
        if(!updateRes.ok) throw new Error("Failed to save products to GitHub");
        return await updateRes.json();
    } catch(err) {
        console.error(err);
        alert("Error saving products: " + err.message);
    }
}

// === RENDER TABLE ===
async function renderTable() {
    const products = await loadProducts();
    const table = document.getElementById("productTable");
    if(!table) return;
    table.innerHTML = "";
    products.forEach(prod => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${prod.id}</td>
            <td>${prod.name}</td>
            <td>${prod.category || "-"}</td>
            <td>$${prod.salePrice}</td>
            <td>${prod.oldPrice ? "$"+prod.oldPrice : "-"}</td>
            <td>
                <button onclick="fillForm(${prod.id})">Edit</button>
                <button onclick="deleteProduct(${prod.id})">Delete</button>
            </td>
        `;
        table.appendChild(tr);
    });
}

// === ADD / UPDATE PRODUCT ===
async function addProduct(product) {
    const products = await loadProducts();
    const id = Number(product.id);
    const index = products.findIndex(p => Number(p.id) === id);
    if(index >= 0){
        products[index] = product; // update existing
        await saveProducts(products);
        alert("Product updated successfully!");
    } else {
        products.push(product); // add new
        await saveProducts(products);
        alert("Product added successfully!");
    }
    renderTable();
}

// === DELETE PRODUCT ===
async function deleteProduct(id) {
    if(!confirm("Are you sure you want to delete this product?")) return;
    const products = await loadProducts();
    const filtered = products.filter(p => Number(p.id) !== Number(id));
    await saveProducts(filtered);
    alert("Product deleted!");
    renderTable();
}

// === FILL FORM FOR EDITING ===
async function fillForm(id) {
    const products = await loadProducts();
    const product = products.find(p => Number(p.id) === Number(id));
    if(!product) return alert("Product not found!");
    document.getElementById("productId").value = product.id;
    document.getElementById("name").value = product.name;
    document.getElementById("desc").value = product.desc;
    document.getElementById("img").value = product.img;
    document.getElementById("salePrice").value = product.salePrice;
    document.getElementById("oldPrice").value = product.oldPrice || "";
    document.getElementById("link").value = product.link;
    document.getElementById("category").value = product.category || "";
}

// === FORM SUBMISSION HANDLER ===
document.getElementById("productForm").addEventListener("submit", async e => {
    e.preventDefault();
    const product = {
        id: Number(document.getElementById("productId").value),
        name: document.getElementById("name").value,
        desc: document.getElementById("desc").value,
        img: document.getElementById("img").value,
        salePrice: parseFloat(document.getElementById("salePrice").value),
        oldPrice: document.getElementById("oldPrice").value ? parseFloat(document.getElementById("oldPrice").value) : null,
        link: document.getElementById("link").value,
        category: document.getElementById("category").value || "Products"
    };
    await addProduct(product);
    e.target.reset();
});

// === INITIALIZE TABLE ===
renderTable();
