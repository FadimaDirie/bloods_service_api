const express = require('express');
const router = express.Router();




// ✅ GET /api/info/health-tips
router.get('/health-tips', (req, res) => {
  const tips = [
    {
      id: 1,
      title_en: "Before Donation",
      title_so: "Kahor Dhiig-bixinta",
      content_en: "Eat iron-rich foods (e.g., spinach, beans), sleep well the night before, and drink plenty of water.",
      content_so: "Cunto birta hodan ku ah cun (sida: isbinaaj, digir), hurdo fiican seexo habeenka ka horreeya, biyo badan cab.",
      type: "pre-donation",
      imageUrl: "https://stanfordbloodcenter.org/wp-content/uploads/2017/05/Preparing-to-donate.jpg"
    },
    {
      id: 2,
      title_en: "After Donation",
      title_so: "Kadib Dhiig-bixinta",
      content_en: "Rest, drink fluids, eat light snacks, and avoid heavy lifting or strenuous activity.",
      content_so: "Nasasho samee, cab biyo, cun cunto fudud, kana fogaaw culeyska ama jimicsi adag.",
      type: "post-donation",
      imageUrl: "https://stanfordbloodcenter.org/wp-content/uploads/2017/06/post-donation.jpg"
    },
    {
      id: 3,
      title_en: "Who Can't Donate",
      title_so: "Yaa Dhiig Bixin Karin",
      content_en: "People with low weight, chronic illnesses, or recent surgeries should avoid donating blood.",
      content_so: "Dadka miisaankoodu hooseeyo, xanuunada joogtada ah leh, ama qalliin dhawaan sameeyey ma bixin karaan dhiig.",
      type: "eligibility",
      imageUrl: "https://media.licdn.com/dms/image/v2/D5622AQGHBe3Hg84dgQ/feedshare-shrink_800/feedshare-shrink_800/0/1722818059181?e=1755129600&v=beta&t=yN6uqyOvRQhNnhJPs5N_s_x2u2C-z7Y2Ffn23MPQKtI"
    },
    {
      id: 4,
      title_en: "Donation Safety",
      title_so: "Badbaadada Dhiig-bixinta",
      content_en: "Blood donation is safe. Sterile, disposable equipment is used for every donor.",
      content_so: "Dhiig-bixintu waa mid ammaan ah. Qalab nadiif ah oo hal mar la isticmaalayo ayaa loo adeegsadaa qof kasta.",
      type: "safety",
      imageUrl: "https://redcliffelabs.com/myhealth/_next/image/?url=https%3A%2F%2Fmyhealth-redcliffelabs.redcliffelabs.com%2Fmedia%2Fblogcard-images%2FNone%2F85da06b1-af61-4632-9c3d-c0c031461970.webp&w=1920&q=75"
    }
  ];

  res.json(tips);
});




// ✅ ADD THIS BELOW
// GET /api/info/compatibility
router.get('/compatibility', (req, res) => {
  const compatibility = {
    "O-": {
      givesTo: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      receivesFrom: ["O-"]
    },
    "O+": {
      givesTo: ["A+", "B+", "AB+", "O+"],
      receivesFrom: ["O+", "O-"]
    },
    "A-": {
      givesTo: ["A+", "A-", "AB+", "AB-"],
      receivesFrom: ["A-", "O-"]
    },
    "A+": {
      givesTo: ["A+", "AB+"],
      receivesFrom: ["A+", "A-", "O+", "O-"]
    },
    "B-": {
      givesTo: ["B+", "B-", "AB+", "AB-"],
      receivesFrom: ["B-", "O-"]
    },
    "B+": {
      givesTo: ["B+", "AB+"],
      receivesFrom: ["B+", "B-", "O+", "O-"]
    },
    "AB-": {
      givesTo: ["AB+", "AB-"],
      receivesFrom: ["AB-", "A-", "B-", "O-"]
    },
    "AB+": {
      givesTo: ["AB+"],
      receivesFrom: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"]
    }
  };

  res.json({ success: true, compatibility });
});




module.exports = router;
