import "./style.css";

document.addEventListener("DOMContentLoaded", () => {
  // --- Auth Guard ---
  const token = localStorage.getItem("accessToken");
  if (!token) {
    window.location.href = "/";
    return;
  }

  // --- Theme Toggle ---
  const themeToggleBtn = document.getElementById("theme-toggle");
  const sunIcon = document.getElementById("sun-icon");
  const moonIcon = document.getElementById("moon-icon");
  const htmlEl = document.documentElement;

  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme) {
    htmlEl.setAttribute("data-theme", savedTheme);
  } else if (prefersDark) {
    htmlEl.setAttribute("data-theme", "dark");
  } else {
    htmlEl.setAttribute("data-theme", "light");
  }
  updateIcons(htmlEl.getAttribute("data-theme"));

  function updateIcons(theme) {
    if (theme === "dark") {
      sunIcon.classList.remove("hidden");
      moonIcon.classList.add("hidden");
    } else {
      sunIcon.classList.add("hidden");
      moonIcon.classList.remove("hidden");
    }
  }

  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = htmlEl.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    htmlEl.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateIcons(newTheme);
  });

  // --- Logout ---
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("accessToken");
    localStorage.setItem("googleLogoutPending", "true");
    window.location.href = "/";
  });

  // --- Fetch Profile ---
  const profileSkeleton = document.getElementById("profile-skeleton");
  const profileCard = document.getElementById("profile-card");

  fetchProfile(token, profileSkeleton, profileCard);
});

async function fetchProfile(token, skeletonEl, cardEl) {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      // Token expired or invalid
      localStorage.removeItem("accessToken");
      window.location.href = "/";
      return;
    }

    const data = await res.json();
    const user = data.user;

    // Populate the profile card
    const initials = getInitials(user.username || user.email);
    document.getElementById("profile-avatar").textContent = initials;
    document.getElementById("profile-name").textContent =
      user.username || "User";
    document.getElementById("profile-email").textContent = user.email;
    document.getElementById("detail-username").textContent =
      user.username || "—";
    document.getElementById("detail-email").textContent = user.email;

    // Swap skeleton → real card
    skeletonEl.classList.add("hidden");
    cardEl.classList.remove("hidden");
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    localStorage.removeItem("accessToken");
    window.location.href = "/";
  }
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}
