"use strict";
import React, { useState } from "react";
export const AdminProducts = ({
  products,
  categories,
  sellers,
  onUpdateProduct,
  onDeleteProduct,
  onApproveProduct,
  onDeleteCategory,
  newCatName,
  setNewCatName,
  newCatDesc,
  setNewCatDesc,
  onCreateCategory,
  onCreateProduct,
  onUpdateCategory,
  onUploadImage
}) => {
  const [subTab, setSubTab] = useState("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [catSearchTerm, setCatSearchTerm] = useState("");
  const [catSortKey, setCatSortKey] = useState("");
  const [catSortOrder, setCatSortOrder] = useState("asc");
  const [addProductName, setAddProductName] = useState("");
  const [addProductPrice, setAddProductPrice] = useState("");
  const [addProductQty, setAddProductQty] = useState("");
  const [addProductWeight, setAddProductWeight] = useState("");
  const [addProductDesc, setAddProductDesc] = useState("");
  const [addProductImage, setAddProductImage] = useState("");
  const [addProductCategory, setAddProductCategory] = useState("");
  const [addProductSeller, setAddProductSeller] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [productStatus, setProductStatus] = useState("pending");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showEditCatModal, setShowEditCatModal] = useState(false);
  const [editCatNameState, setEditCatNameState] = useState("");
  const [editCatDescState, setEditCatDescState] = useState("");
  const [previewProduct, setPreviewProduct] = useState(null);
  const [previewCategory, setPreviewCategory] = useState(null);
  const handleProductSort = (key) => {
    if (sortKey === key) {
      setSortOrder((prev) => prev === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };
  const [currentProductPage, setCurrentProductPage] = useState(1);
  const [currentCategoryPage, setCurrentCategoryPage] = useState(1);
  const itemsPerPage = 10;
  const handleCategorySort = (key) => {
    if (catSortKey === key) {
      setCatSortOrder((prev) => prev === "asc" ? "desc" : "asc");
    } else {
      setCatSortKey(key);
      setCatSortOrder("asc");
    }
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditProductId(null);
    setAddProductName("");
    setAddProductPrice("");
    setAddProductQty("");
    setAddProductWeight("");
    setAddProductDesc("");
    setAddProductImage("");
    setAddProductCategory("");
    setAddProductSeller("");
    setProductStatus("pending");
  };
  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!addProductCategory || !addProductSeller) {
      alert("Please select both a category and a seller.");
      return;
    }
    try {
      const productData = {
        name: addProductName,
        price: parseFloat(addProductPrice) || 0,
        stock_quantity: parseInt(addProductQty) || 0,
        weight_grams: parseFloat(addProductWeight) || 0,
        description: addProductDesc,
        image_url: addProductImage || null,
        category_id: addProductCategory,
        seller_id: addProductSeller,
        is_combo: false,
        is_approved: productStatus === "approved"
      };
      let response;
      if (isEditing && editProductId) {
        response = await onUpdateProduct(editProductId, productData);
      } else {
        response = await onCreateProduct(productData);
      }
      if (response) {
        alert(isEditing ? "Product updated successfully!" : "Product created successfully!");
        handleCancelEdit();
      } else {
        alert("Operation failed. Please check the console for details.");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert(`Error saving product: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  const handleEditCategorySubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory) return;
    await onUpdateCategory(selectedCategory.id, editCatNameState, editCatDescState);
    setShowEditCatModal(false);
    setSelectedCategory(null);
  };
  const filteredProducts = products.filter((p) => {
    const s = searchTerm.toLowerCase();
    return (p.name || "").toLowerCase().includes(s) || (p.description || "").toLowerCase().includes(s) || (p.id || "").toLowerCase().includes(s);
  });
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortKey) return 0;
    let aVal = a[sortKey];
    let bVal = b[sortKey];
    if (sortKey === "price" || sortKey === "stock_quantity" || sortKey === "weight_grams") {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    } else {
      aVal = String(aVal || "").toLowerCase();
      bVal = String(bVal || "").toLowerCase();
    }
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
  const totalProductPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice((currentProductPage - 1) * itemsPerPage, currentProductPage * itemsPerPage);
  const filteredCategories = categories.filter((c) => {
    const s = catSearchTerm.toLowerCase();
    return (c.name || "").toLowerCase().includes(s) || (c.description || "").toLowerCase().includes(s) || (c.id || "").toLowerCase().includes(s);
  });
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (!catSortKey) return 0;
    let aVal = a[catSortKey];
    let bVal = b[catSortKey];
    aVal = String(aVal || "").toLowerCase();
    bVal = String(bVal || "").toLowerCase();
    if (aVal < bVal) return catSortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return catSortOrder === "asc" ? 1 : -1;
    return 0;
  });
  const totalCategoryPages = Math.ceil(sortedCategories.length / itemsPerPage);
  const paginatedCategories = sortedCategories.slice((currentCategoryPage - 1) * itemsPerPage, currentCategoryPage * itemsPerPage);
  const SortIndicator = ({ k }) => {
    if (sortKey !== k) return /* @__PURE__ */ React.createElement("span", { className: "ml-1 text-zinc-400 text-[10px] select-none" }, "\u21C5");
    return sortOrder === "asc" ? /* @__PURE__ */ React.createElement("span", { className: "ml-1 text-primary text-[10px] select-none" }, "\u25B2") : /* @__PURE__ */ React.createElement("span", { className: "ml-1 text-primary text-[10px] select-none" }, "\u25BC");
  };
  const CatSortIndicator = ({ k }) => {
    if (catSortKey !== k) return /* @__PURE__ */ React.createElement("span", { className: "ml-1 text-zinc-400 text-[10px] select-none" }, "\u21C5");
    return catSortOrder === "asc" ? /* @__PURE__ */ React.createElement("span", { className: "ml-1 text-primary text-[10px] select-none" }, "\u25B2") : /* @__PURE__ */ React.createElement("span", { className: "ml-1 text-primary text-[10px] select-none" }, "\u25BC");
  };
  const getPaddedImages = (product) => {
    if (!product) return [];
    let imgs = [];
    try {
      if (typeof product.images === "string") imgs = JSON.parse(product.images);
      else if (Array.isArray(product.images)) imgs = [...product.images];
    } catch (e) {
    }
    if (imgs.length === 0 && product.image_url) {
      if (product.image_url.includes(",")) {
        imgs = product.image_url.split(",").map((url) => url.trim()).filter((url) => url);
      } else {
        imgs.push(product.image_url);
      }
    }
    return imgs.length > 0 ? imgs : ["https://via.placeholder.com/150"];
  };
  const handleEditProductClick = (p) => {
    setIsEditing(true);
    setEditProductId(p.id);
    setAddProductName(p.name);
    setAddProductPrice(p.price.toString());
    setAddProductQty(p.stock_quantity.toString());
    setAddProductWeight(p.weight_grams?.toString() || "");
    setAddProductDesc(p.description || "");
    setAddProductImage(getPaddedImages(p).join(", "));
    setAddProductCategory(categories.find((c) => c.name === p.category_name)?.id || "");
    setAddProductSeller(sellers.find((s) => s.businessName === p.seller_name)?.id || "");
    setProductStatus(p.is_approved ? "approved" : "pending");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("header", { className: "flex flex-col sm:flex-row justify-between sm:items-center gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-bold font-heading" }, "Product and Categories"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-zinc-500 mt-1" }, "Audit, edit, and update platform products and specialty categories.")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setSubTab("products");
        setSearchTerm("");
      },
      className: `px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${subTab === "products" ? "bg-white dark:bg-zinc-900 text-primary shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`
    },
    "Products (",
    products.length,
    ")"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setSubTab("categories");
        setCatSearchTerm("");
      },
      className: `px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${subTab === "categories" ? "bg-white dark:bg-zinc-900 text-primary shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`
    },
    "Categories (",
    categories.length,
    ")"
  )))), subTab === "products" ? /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-[#15131b] border border-[#e8e1dd] dark:border-[#2f2b3b] p-6 rounded-2xl shadow-sm h-fit" }, /* @__PURE__ */ React.createElement("h3", { className: "text-md font-bold mb-4 font-heading" }, isEditing ? "Edit Product" : "Add Product"), /* @__PURE__ */ React.createElement("form", { onSubmit: handleAddProductSubmit, className: "space-y-4 text-xs font-semibold" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-zinc-500 mb-1" }, "Product Name"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: addProductName,
      onChange: (e) => setAddProductName(e.target.value),
      placeholder: "e.g. Traditional Nagore Halwa",
      className: "w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm",
      required: true
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React.createElement("label", { className: "block text-zinc-500 mb-1" }, "Price (\u20B9)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      value: addProductPrice,
      onChange: (e) => setAddProductPrice(e.target.value),
      placeholder: "299",
      className: "w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-mono",
      required: true
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React.createElement("label", { className: "block text-zinc-500 mb-1" }, "Stock"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      value: addProductQty,
      onChange: (e) => setAddProductQty(e.target.value),
      placeholder: "50",
      className: "w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-mono",
      required: true
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React.createElement("label", { className: "block text-zinc-500 mb-1" }, "Weight (g)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      value: addProductWeight,
      onChange: (e) => setAddProductWeight(e.target.value),
      placeholder: "500",
      className: "w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-mono",
      required: true
    }
  ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-zinc-500 mb-1" }, "Product Image Files"), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-zinc-400 mb-2" }, "First file upload is the preview page image."), /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, [0, 1, 2, 3].map((index) => /* @__PURE__ */ React.createElement(
    "input",
    {
      key: index,
      type: "file",
      accept: "image/*",
      onChange: async (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          setIsUploading(true);
          const url = await onUploadImage(files[0]);
          setIsUploading(false);
          if (url) {
            setAddProductImage((prev) => {
              const urls = prev ? prev.split(",") : ["", "", "", ""];
              while (urls.length < 4) urls.push("");
              urls[index] = url;
              return urls.join(",");
            });
          }
        }
      },
      className: "w-full text-xs text-zinc-500 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2 bg-white dark:bg-zinc-950"
    }
  ))), isUploading && /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-yellow-500 mt-1" }, "Uploading to MinIO..."), addProductImage && /* @__PURE__ */ React.createElement("div", { className: "mt-2 flex flex-wrap items-center gap-2" }, addProductImage.split(",").map((imgUrl, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "flex flex-col items-center" }, /* @__PURE__ */ React.createElement("img", { src: imgUrl.trim(), alt: "Preview", className: "w-12 h-12 object-cover rounded-lg border" }))))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-zinc-500 mb-1" }, "Category"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: addProductCategory,
      onChange: (e) => setAddProductCategory(e.target.value),
      className: "w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm",
      required: true
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "-- Select Category --"),
    categories.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, c.name))
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-zinc-500 mb-1" }, "Seller / Merchant"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: addProductSeller,
      onChange: (e) => setAddProductSeller(e.target.value),
      className: "w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm",
      required: true
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "-- Select Seller --"),
    sellers.length > 0 ? sellers.map((s) => /* @__PURE__ */ React.createElement("option", { key: s.id, value: s.id }, s.business_name || s.businessName || `Seller #${s.id}`)) : /* @__PURE__ */ React.createElement("option", { value: "", disabled: true }, "No merchants available")
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-zinc-500 mb-1" }, "Description"), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      value: addProductDesc,
      onChange: (e) => setAddProductDesc(e.target.value),
      placeholder: "Enter details...",
      rows: 2,
      className: "w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm"
    }
  )), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      disabled: sellers.length === 0 || categories.length === 0,
      className: "w-full bg-[#3f3b4c] dark:bg-[#ccc6dc] text-white dark:text-zinc-950 py-2.5 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all text-xs disabled:cursor-not-allowed disabled:opacity-50"
    },
    "Create Product"
  ), sellers.length === 0 && /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-amber-600 dark:text-amber-400 mt-2" }, "No merchants available. Ensure there are approved sellers."))), /* @__PURE__ */ React.createElement("div", { className: "lg:col-span-2 space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center bg-zinc-50 dark:bg-[#110e16] p-4 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b]" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement("span", { className: "absolute left-3 top-2.5 text-zinc-400 text-xs" }, "\u{1F50D}"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Search products...",
      value: searchTerm,
      onChange: (e) => setSearchTerm(e.target.value),
      className: "pl-8 pr-4 py-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-lg text-xs outline-none focus:border-primary"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "text-zinc-400 text-xs" }, "Showing ", paginatedProducts.length, " (Total: ", sortedProducts.length, ") of ", products.length, " products")), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-[#15131b] border border-[#e8e1dd] dark:border-[#2f2b3b] p-6 rounded-2xl shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left text-xs min-w-[700px]" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px] select-none" }, /* @__PURE__ */ React.createElement("th", { className: "py-2.5" }, "Image"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 cursor-pointer hover:text-primary transition-colors", onClick: () => handleProductSort("name") }, "Name ", /* @__PURE__ */ React.createElement(SortIndicator, { k: "name" })), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 cursor-pointer hover:text-primary transition-colors", onClick: () => handleProductSort("price") }, "Price ", /* @__PURE__ */ React.createElement(SortIndicator, { k: "price" })), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 cursor-pointer hover:text-primary transition-colors", onClick: () => handleProductSort("stock_quantity") }, "Stock ", /* @__PURE__ */ React.createElement(SortIndicator, { k: "stock_quantity" })), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 cursor-pointer hover:text-primary transition-colors", onClick: () => handleProductSort("is_approved") }, "Status ", /* @__PURE__ */ React.createElement(SortIndicator, { k: "is_approved" })), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 text-right" }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", null, paginatedProducts.map((p) => /* @__PURE__ */ React.createElement("tr", { key: p.id, className: "border-b border-zinc-100 dark:border-zinc-900" }, /* @__PURE__ */ React.createElement("td", { className: "py-3" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: getPaddedImages(p)[0],
      alt: p.name,
      className: "w-10 h-10 object-cover rounded-lg"
    }
  )), /* @__PURE__ */ React.createElement(
    "td",
    {
      className: "py-3 font-bold text-[#3874ff] cursor-pointer hover:underline",
      onClick: () => setPreviewProduct(p)
    },
    p.name
  ), /* @__PURE__ */ React.createElement("td", { className: "py-3 font-mono font-bold text-primary" }, "\u20B9", Number(p.price).toLocaleString()), /* @__PURE__ */ React.createElement("td", { className: "py-3 font-mono" }, p.stock_quantity, " units"), /* @__PURE__ */ React.createElement("td", { className: "py-3" }, /* @__PURE__ */ React.createElement("span", { className: p.is_approved ? "bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px]" : "bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded text-[10px]" }, p.is_approved ? "Approved" : "Pending")), /* @__PURE__ */ React.createElement("td", { className: "py-3 text-right" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-end gap-1.5" }, !p.is_approved && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => onApproveProduct(p.id, true),
      className: "bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-[10px] font-bold"
    },
    "Approve"
  ), p.is_approved && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => onApproveProduct(p.id, false),
      className: "bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded text-[10px] font-bold"
    },
    "Reject"
  ), !p.is_approved && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => onApproveProduct(p.id, false),
      className: "bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-[10px] font-bold"
    },
    "Reject"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleEditProductClick(p),
      className: "bg-charcoal dark:bg-zinc-800 text-white dark:text-zinc-200 px-3 py-1.5 rounded text-[10px] font-bold hover:opacity-90"
    },
    "Edit"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        if (confirm(`Are you sure you want to delete product "${p.name}"?`)) {
          onDeleteProduct(p.id);
        }
      },
      className: "bg-red-500 hover:bg-red-650 text-white px-3 py-1.5 rounded text-[10px] font-bold"
    },
    "Delete"
  ))))), sortedProducts.length === 0 && /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 6, className: "py-6 text-center text-zinc-400" }, "No products found."))))), totalProductPages > 1 && /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mt-4 text-xs font-semibold text-zinc-500" }, /* @__PURE__ */ React.createElement("span", null, "Page ", currentProductPage, " of ", totalProductPages), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement("button", { disabled: currentProductPage === 1, onClick: () => setCurrentProductPage((c) => c - 1), className: "px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50" }, "Prev"), /* @__PURE__ */ React.createElement("button", { disabled: currentProductPage === totalProductPages, onClick: () => setCurrentProductPage((c) => c + 1), className: "px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50" }, "Next")))))) : /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-[#15131b] border border-[#e8e1dd] dark:border-[#2f2b3b] p-6 rounded-2xl shadow-sm h-fit" }, /* @__PURE__ */ React.createElement("h3", { className: "text-md font-bold mb-4 font-heading" }, "Add Category"), /* @__PURE__ */ React.createElement("form", { onSubmit: onCreateCategory, className: "space-y-4 text-xs font-semibold" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-zinc-500 mb-1" }, "Category Name"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: newCatName,
      onChange: (e) => setNewCatName(e.target.value),
      placeholder: "e.g. Traditional Halwas",
      className: "w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm",
      required: true
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-zinc-500 mb-1" }, "Description"), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      value: newCatDesc,
      onChange: (e) => setNewCatDesc(e.target.value),
      placeholder: "Rich heritage wheat and ghee based sweets...",
      rows: 4,
      className: "w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm"
    }
  )), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      className: "w-full bg-[#3f3b4c] dark:bg-[#ccc6dc] text-white dark:text-zinc-950 py-2.5 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all text-xs"
    },
    "Create Category"
  ))), /* @__PURE__ */ React.createElement("div", { className: "lg:col-span-2 space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center bg-zinc-50 dark:bg-[#110e16] p-4 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b]" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement("span", { className: "absolute left-3 top-2.5 text-zinc-400 text-xs" }, "\u{1F50D}"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Search categories...",
      value: catSearchTerm,
      onChange: (e) => setCatSearchTerm(e.target.value),
      className: "pl-8 pr-4 py-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-lg text-xs outline-none focus:border-primary"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "text-zinc-400 text-xs" }, "Showing ", sortedCategories.length, " of ", categories.length, " categories")), /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-[#15131b] border border-[#e8e1dd] dark:border-[#2f2b3b] p-6 rounded-2xl shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left text-xs" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px] select-none" }, /* @__PURE__ */ React.createElement("th", { className: "py-2.5 cursor-pointer hover:text-primary transition-colors", onClick: () => handleCategorySort("name") }, "Category Name ", /* @__PURE__ */ React.createElement(CatSortIndicator, { k: "name" })), /* @__PURE__ */ React.createElement("th", { className: "py-2.5" }, "Description"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 text-right" }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", null, paginatedCategories.map((cat) => /* @__PURE__ */ React.createElement("tr", { key: cat.id, className: "border-b border-zinc-100 dark:border-zinc-900" }, /* @__PURE__ */ React.createElement("td", { className: "py-3 font-bold text-zinc-800 dark:text-zinc-200" }, cat.name), /* @__PURE__ */ React.createElement("td", { className: "py-3 text-zinc-500" }, cat.description || "No description provided."), /* @__PURE__ */ React.createElement("td", { className: "py-3 text-right" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-end gap-1.5" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setSelectedCategory(cat);
        setEditCatNameState(cat.name);
        setEditCatDescState(cat.description || "");
        setShowEditCatModal(true);
      },
      className: "bg-charcoal dark:bg-zinc-800 text-white dark:text-zinc-200 px-3 py-1.5 rounded text-[10px] font-bold hover:opacity-90"
    },
    "Edit"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        if (confirm(`Are you sure you want to delete category "${cat.name}"? This might break products linked to it!`)) {
          onDeleteCategory(cat.id);
        }
      },
      className: "bg-red-500 hover:bg-red-650 text-white px-3 py-1.5 rounded text-[10px] font-bold"
    },
    "Delete"
  ))))), sortedCategories.length === 0 && /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 3, className: "py-6 text-center text-zinc-400" }, "No categories found."))))), totalCategoryPages > 1 && /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mt-4 text-xs font-semibold text-zinc-500" }, /* @__PURE__ */ React.createElement("span", null, "Page ", currentCategoryPage, " of ", totalCategoryPages), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement("button", { disabled: currentCategoryPage === 1, onClick: () => setCurrentCategoryPage((c) => c - 1), className: "px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50" }, "Prev"), /* @__PURE__ */ React.createElement("button", { disabled: currentCategoryPage === totalCategoryPages, onClick: () => setCurrentCategoryPage((c) => c + 1), className: "px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50" }, "Next")))))), showEditCatModal && selectedCategory && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-[#fff8f4] dark:bg-[#15131b] border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-zinc-900 dark:text-zinc-100" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-bold font-heading mb-4" }, "Edit Specialty Category"), /* @__PURE__ */ React.createElement("form", { onSubmit: handleEditCategorySubmit, className: "space-y-4 text-xs font-semibold" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-zinc-500 mb-1" }, "Category Name"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: editCatNameState,
      onChange: (e) => setEditCatNameState(e.target.value),
      className: "w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none",
      required: true
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-zinc-500 mb-1" }, "Description"), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      value: editCatDescState,
      onChange: (e) => setEditCatDescState(e.target.value),
      rows: 4,
      className: "w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none",
      required: true
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3 justify-end pt-4" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        setShowEditCatModal(false);
        setSelectedCategory(null);
      },
      className: "px-4 py-2 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
    },
    "Cancel"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      className: "px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-opacity-90 font-bold"
    },
    "Save Changes"
  ))))), previewProduct && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800" }, /* @__PURE__ */ React.createElement("div", { className: "bg-zinc-50 dark:bg-zinc-800/50 p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold font-heading text-lg flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xl" }, "\u{1F4E6}"), " Product Details"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setPreviewProduct(null),
      className: "w-8 h-8 flex items-center justify-center bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
    },
    "\u2715"
  )), /* @__PURE__ */ React.createElement("div", { className: "p-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-6 mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "w-32 flex flex-col gap-2" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: getPaddedImages(previewProduct)[0],
      alt: previewProduct.name,
      className: "w-32 h-32 object-cover rounded-xl border border-zinc-200 dark:border-zinc-700"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, (() => {
    let parsed = [];
    try {
      if (typeof previewProduct.images === "string") parsed = JSON.parse(previewProduct.images);
      else if (Array.isArray(previewProduct.images)) parsed = previewProduct.images;
    } catch (e) {
    }
    let imgs = [...parsed];
    if (imgs.length === 0 && previewProduct.image_url) imgs.push(previewProduct.image_url);
    return imgs.slice(0, 4).map((img, idx) => /* @__PURE__ */ React.createElement("img", { key: idx, src: img, className: "w-8 h-8 object-cover rounded border border-zinc-200 dark:border-zinc-700" }));
  })())), /* @__PURE__ */ React.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React.createElement("h4", { className: "text-xl font-bold mb-1" }, previewProduct.name), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-mono text-primary font-bold mb-2" }, "\u20B9", previewProduct.price), /* @__PURE__ */ React.createElement("div", { className: "flex gap-4 text-sm mb-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 text-zinc-600 dark:text-zinc-400" }, /* @__PURE__ */ React.createElement("span", null, "Stock:"), /* @__PURE__ */ React.createElement("strong", { className: "text-zinc-900 dark:text-white" }, previewProduct.stock_quantity, " units")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 text-zinc-600 dark:text-zinc-400" }, /* @__PURE__ */ React.createElement("span", null, "Weight:"), /* @__PURE__ */ React.createElement("strong", { className: "text-zinc-900 dark:text-white" }, previewProduct.weight_grams, "g"))), previewProduct.category_name && /* @__PURE__ */ React.createElement("div", { className: "inline-block px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-xs font-bold rounded" }, "Category: ", previewProduct.category_name))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h5", { className: "font-bold text-sm mb-2 text-zinc-500 uppercase tracking-wider" }, "Description"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800" }, previewProduct.description || "No description provided.")), previewProduct.seller_name && /* @__PURE__ */ React.createElement("div", { className: "mt-4 flex items-center gap-2 text-sm text-zinc-500" }, /* @__PURE__ */ React.createElement("span", null, "Sold by:"), /* @__PURE__ */ React.createElement("strong", { className: "text-zinc-900 dark:text-white" }, previewProduct.seller_name)), /* @__PURE__ */ React.createElement("div", { className: "mt-6" }, /* @__PURE__ */ React.createElement("h5", { className: "font-bold text-sm mb-2 text-zinc-500 uppercase tracking-wider" }, "Additional Images"), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 overflow-x-auto pb-2" }, getPaddedImages(previewProduct).map((img, idx) => /* @__PURE__ */ React.createElement(
    "img",
    {
      key: idx,
      src: img,
      alt: `${previewProduct.name} ${idx + 1}`,
      className: "w-24 h-24 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700"
    }
  ))))))), previewCategory && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800" }, /* @__PURE__ */ React.createElement("div", { className: "bg-zinc-50 dark:bg-zinc-800/50 p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold font-heading text-lg" }, "Category Details"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setPreviewCategory(null),
      className: "w-8 h-8 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full hover:bg-zinc-300 transition-colors flex justify-center items-center font-bold"
    },
    "\u2715"
  )), /* @__PURE__ */ React.createElement("div", { className: "p-6" }, /* @__PURE__ */ React.createElement("h4", { className: "text-xl font-bold mb-2" }, previewCategory.name), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-zinc-600 dark:text-zinc-400 mb-4" }, previewCategory.description || "No description available."), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-zinc-500" }, "Created on: ", new Date(previewCategory.created_at || "").toLocaleDateString())))));
};
