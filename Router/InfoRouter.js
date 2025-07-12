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
      imageUrl: "https://cdn.pixabay.com/photo/2016/08/17/03/48/iron-1594619_960_720.jpg"
    },
    {
      id: 2,
      title_en: "After Donation",
      title_so: "Kadib Dhiig-bixinta",
      content_en: "Rest, drink fluids, eat light snacks, and avoid heavy lifting or strenuous activity.",
      content_so: "Nasasho samee, cab biyo, cun cunto fudud, kana fogaaw culeyska ama jimicsi adag.",
      type: "post-donation",
      imageUrl: "https://cdn.pixabay.com/photo/2017/03/28/12/10/woman-2182971_960_720.jpg"
    },
    {
      id: 3,
      title_en: "Who Can't Donate",
      title_so: "Yaa Dhiig Bixin Karin",
      content_en: "People with low weight, chronic illnesses, or recent surgeries should avoid donating blood.",
      content_so: "Dadka miisaankoodu hooseeyo, xanuunada joogtada ah leh, ama qalliin dhawaan sameeyey ma bixin karaan dhiig.",
      type: "eligibility",
      imageUrl: "https://cdn.pixabay.com/photo/2017/01/31/21/23/stop-2027887_960_720.png"
    },
    {
      id: 4,
      title_en: "Donation Safety",
      title_so: "Badbaadada Dhiig-bixinta",
      content_en: "Blood donation is safe. Sterile, disposable equipment is used for every donor.",
      content_so: "Dhiig-bixintu waa mid ammaan ah. Qalab nadiif ah oo hal mar la isticmaalayo ayaa loo adeegsadaa qof kasta.",
      type: "safety",
      imageUrl: "https://cdn.pixabay.com/photo/2014/04/02/14/09/blood-307558_960_720.png"
    }
  ];

  res.json(tips);
});




// ✅ ADD THIS BELOW
// GET /api/info/compatibility
router.get('/compatibility', (req, res) => {
    const matrix = {
      'A+': ['A+', 'AB+'],
      'O+': ['O+', 'A+', 'B+', 'AB+'],
      'B+': ['B+', 'AB+'],
      'AB+': ['AB+'],
      'A-': ['A-', 'A+', 'AB-', 'AB+'],
      'O-': ['Everyone'],
      'B-': ['B-', 'B+', 'AB-', 'AB+'],
      'AB-': ['AB-', 'AB+']
    };
    res.json(matrix);
  });




module.exports = router;
