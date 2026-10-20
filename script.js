
"use strict";

const starterPosts = [
    {
        id: 1,
        title: "The Importance of Higher Education",
        category: "Education",
        author: "Editorial Team",
        content: "Higher education builds knowledge, critical thinking and professional skills. It helps students prepare for future careers and lifelong learning.",
        date: "2026-10-20"
    },
    {
        id: 2,
        title: "Technology in Modern Education",
        category: "Technology",
        author: "Editorial Team",
        content: "Digital tools and online learning help students research, collaborate and develop valuable computer skills.",
        date: "2026-10-20"
    },
    {
        id: 3,
        title: "Making the Most of Campus Life",
        category: "Campus Life",
        author: "Student Contributor",
        content: "Campus life gives students opportunities to make friends, develop confidence and participate in new activities.",
        date: "2026-10-20"
    },
    {
        id: 4,
        title: "Why University Events Matter",
        category: "Events",
        author: "Editorial Team",
        content: "Workshops, seminars and student events encourage teamwork and help students discover new interests.",
        date: "2026-10-20"
    },
    {
        id: 5,
        title: "Start Learning Programming",
        category: "Technology",
        author: "Student Contributor",
        content: "HTML, CSS, JavaScript and C are useful starting points for students who want to learn programming.",
        date: "2026-10-20"
    },
    {
        id: 6,
        title: "Simple Study Habits for Students",
        category: "Education",
        author: "Editorial Team",
        content: "A study timetable, regular revision and clear goals can help students improve their learning routine.",
        date: "2026-10-20"
    }
];

const STORAGE_KEY = "ulay_blog_posts_v3";
const allowedCategories = [
    "Education",
    "Technology",
    "Campus Life",
    "Events"
];

const blogGrid = document.getElementById("blogGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const postCount = document.getElementById("postCount");
const emptyMessage = document.getElementById("emptyMessage");
const blogForm = document.getElementById("blogForm");
const formMessage = document.getElementById("formMessage");
const mainNav = document.getElementById("mainNav");
const menuToggle = document.getElementById("menuToggle");

function loadPosts() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved === null) {
            return starterPosts.map(post => ({ ...post }));
        }

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            return starterPosts.map(post => ({ ...post }));
        }

        return parsed.filter(post =>
            post &&
            ["number", "string"].includes(typeof post.id) &&
            typeof post.title === "string" &&
            typeof post.category === "string" &&
            typeof post.author === "string" &&
            typeof post.content === "string"
        );
    } catch (error) {
        return starterPosts.map(post => ({ ...post }));
    }
}

let posts = loadPosts();

function savePosts() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
        return true;
    } catch (error) {
        return false;
    }
}

// Escape text before inserting it into the page.
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function renderPosts() {
    const query = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;

    const filteredPosts = posts.filter(post => {
        const searchableText = [
            post.title,
            post.category,
            post.author,
            post.content
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(query);
        const matchesCategory =
            category === "All" || post.category === category;

        return matchesSearch && matchesCategory;
    });

    postCount.textContent =
        `${filteredPosts.length} ${
            filteredPosts.length === 1 ? "post" : "posts"
        }`;

    emptyMessage.hidden = filteredPosts.length !== 0;

    blogGrid.innerHTML = filteredPosts.map(post => `
        <article class="blog-card">
            <div class="card-banner">
                ${escapeHTML(post.title.trim().charAt(0).toUpperCase() || "B")}
            </div>

            <div class="card-body">
                <span class="category">
                    ${escapeHTML(post.category)}
                </span>

                <h3>${escapeHTML(post.title)}</h3>

                <p>${escapeHTML(post.content)}</p>

                <div class="card-meta">
                    By ${escapeHTML(post.author)}
                    &bull; ${escapeHTML(post.date || "")}
                </div>

                <button class="read-btn"
                        type="button"
                        data-read="${escapeHTML(post.id)}">
                    Read More →
                </button>

                <button class="delete-btn"
                        type="button"
                        data-delete="${escapeHTML(post.id)}">
                    Delete
                </button>
            </div>
        </article>
    `).join("");
}

searchInput.addEventListener("input", renderPosts);
categoryFilter.addEventListener("change", renderPosts);

blogForm.addEventListener("submit", event => {
    event.preventDefault();

    const title = document.getElementById("blogTitle").value.trim();
    const category = document.getElementById("blogCategory").value;
    const author = document.getElementById("blogAuthor").value.trim();
    const content = document.getElementById("blogContent").value.trim();

    if (!title || !author || !content) {
        formMessage.textContent = "Please fill in every field.";
        return;
    }

    if (!allowedCategories.includes(category)) {
        formMessage.textContent = "Please select a valid category.";
        return;
    }

    const newPost = {
        id: Date.now(),
        title,
        category,
        author,
        content,
        date: new Date().toISOString().slice(0, 10)
    };

    posts.unshift(newPost);

    if (!savePosts()) {
        posts.shift();
        formMessage.textContent =
            "Unable to save this post. Check browser storage settings.";
        return;
    }

    blogForm.reset();
    searchInput.value = "";
    categoryFilter.value = "All";
    formMessage.textContent = "Your blog post was published successfully.";

    renderPosts();

    document.getElementById("blogs").scrollIntoView({
        behavior: "smooth"
    });
});

blogGrid.addEventListener("click", event => {
    const readButton = event.target.closest("[data-read]");
    const deleteButton = event.target.closest("[data-delete]");

    if (readButton) {
        const post = posts.find(
            item => String(item.id) === readButton.dataset.read
        );

        if (post) {
            window.alert(
                post.title +
                "\n\nCategory: " + post.category +
                "\nAuthor: " + post.author +
                "\n\n" + post.content
            );
        }
    }

    if (deleteButton) {
        const id = deleteButton.dataset.delete;

        if (!window.confirm("Delete this blog post?")) {
            return;
        }

        const previousPosts = posts;
        posts = posts.filter(item => String(item.id) !== id);

        if (!savePosts()) {
            posts = previousPosts;
            formMessage.textContent = "Could not save this change.";
        } else {
            formMessage.textContent = "Blog post deleted.";
        }

        renderPosts();
    }
});

// Mobile navigation
menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
});

mainNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        mainNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
    });
});

document.getElementById("year").textContent =
    new Date().getFullYear();

renderPosts();
