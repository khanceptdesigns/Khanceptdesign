// === CONFIG ===
const GITHUB_USERNAME = "KhanceptDesigns";
const REPO_NAME = "Khanceptdesign";
const FILE_PATH = "products.json";

// This will be updated dynamically from the form
let GITHUB_TOKEN = "";

// --- Load products from GitHub
async function loadProducts() {
    try {
        const res = await fetch(`https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/main/${FILE_PATH}`);
        if (!res.ok) throw new Error("Failed to load products from GitHub");
        return await res.json();
    } catch (err) {
        alert("Error loading products: " + err.message);
        return [];
    }
}

// --- Save products to GitHub
async function saveProducts(products) {
    try {
        if (!GITHUB_TOKEN) {
            alert("❌ GitHub Token Missing. Enter your token in the form.");
            return;
        }

        // Get file metadata
        const fileInfoRes = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: {
                "Authorization": `Bearer ${GITHUB_TOKEN}`
            }
        });

        if (!fileInfoRes.ok) {
            throw new Error("GitHub Save Error: " + await fileInfoRes.text());
        }

        const fileInfo = await fileInfoRes.json();

        // Upload new version
        const updateRes = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`, {
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
        });

        if(!updateRes.ok) {
            throw new Error("GitHub Save Error: " + await updateRes.text());
        }

        return await updateRes.json();

    } catch(err) {
        alert("Error saving products: " + err.message);
    }
}

// --- Render products table
async function renderTable() {
    const products = await loadProducts();
    const table = document.getElementById("productTable");
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
                <button class="edit-btn" onclick="fillForm(${prod.id})">Edit</button>
                <button class="delete-btn" onclick="deleteProduct(${prod.id})">Delete</button>
            </td>
        `;
        table.appendChild(tr);
    });
}

// --- Add or update product
async function addProduct(product) {
    let products = await loadProducts();
    const index = products.findIndex(p => Number(p.id) === Number(product.id));

    if(index >= 0) products[index] = product;
    else products.push(product);

    await saveProducts(products);
    renderTable();
}

// --- Delete product
async function deleteProduct(id) {
    if(!confirm("Delete this product?")) return;

    let products = await loadProducts();
    products = products.filter(p => Number(p.id) !== Number(id));

    await saveProducts(products);
    renderTable();
}

// --- Fill edit form
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

// --- Form submit
document.getElementById("productForm").addEventListener("submit", async e => {
    e.preventDefault();

    GITHUB_TOKEN = document.getElementById("token").value.trim();

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

// --- Start
renderTable();
