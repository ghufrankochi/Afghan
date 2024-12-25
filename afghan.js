// Firebase Configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Global Variables
let currentUserId = null;

// Generate Referral Code
function generateReferralCode(userId) {
  return `REF${userId.substring(0, 5).toUpperCase()}`;
}

// Create User
document.getElementById("signup-btn").addEventListener("click", () => {
  const name = document.getElementById("username").value;
  if (!name) return alert("Please enter your name!");

  const userId = `user${Date.now()}`; // Unique user ID
  const referralCode = generateReferralCode(userId);
  currentUserId = userId;

  const userRef = ref(db, `users/${userId}`);
  set(userRef, {
    name: name,
    balance: 0,
    referralCode: referralCode,
    referredBy: null
  }).then(() => {
    alert("Account created successfully!");
    displayUserInfo(userId);
  }).catch((error) => console.error("Error creating user:", error));
});

// Apply Referral Code
document.getElementById("referral-btn").addEventListener("click", () => {
  if (!currentUserId) return alert("Please create an account first!");

  const referralCode = document.getElementById("referral-code").value;
  if (!referralCode) return alert("Please enter a referral code!");

  const usersRef = ref(db, `users`);
  get(usersRef).then((snapshot) => {
    const users = snapshot.val();
    let referrerId = null;

    for (const userId in users) {
      if (users[userId].referralCode === referralCode) {
        referrerId = userId;
        break;
      }
    }

    if (referrerId) {
      // Update new user's referredBy field
      update(ref(db, `users/${currentUserId}`), { referredBy: referralCode }).then(() => {
        // Add rewards
        update(ref(db, `users/${referrerId}`), {
          balance: users[referrerId].balance + 2 // 2 AFN for referrer
        });

        update(ref(db, `users/${currentUserId}`), {
          balance: users[currentUserId].balance + 2 // 2 AFN for new user
        }).then(() => {
          alert("Referral bonus applied!");
          displayUserInfo(currentUserId);
        });
      });
    } else {
      alert("Invalid referral code!");
    }
  }).catch((error) => console.error("Error fetching users:", error));
});

// Display User Info
function displayUserInfo(userId) {
  const userRef = ref(db, `users/${userId}`);
  get(userRef).then((snapshot) => {
    if (snapshot.exists()) {
      const userData = snapshot.val();
      document.getElementById("user-name").textContent = userData.name;
      document.getElementById("user-balance").textContent = userData.balance;
      document.getElementById("user-ref-code").textContent = userData.referralCode;
    } else {
      console.log("No user data found!");
    }
  }).catch((error) => console.error("Error fetching user data:", error));
}