const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const { body, validationResult, check } = require("express-validator");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const {
  loadContacts,
  findContact,
  addContact,
  checkDuplikat,
  deleteContact,
  updateContacts,
} = require("./utils/contacts");

const app = express();
const port = 3000; // Port

// Menggunakan template engine EJS
app.set("view engine", "ejs");

app.use(expressLayouts);
app.use(express.static("public")); // Menentukan tempat asset static
app.use(express.urlencoded({ extended: true }));

// Konfigurasi Flash Session
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: {
      maxAge: 6000,
    },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// Halaman Home //
app.get("/", (req, res) => {
  const mahasiswa = [
    {
      nama: "Andry Pebrianto",
      email: "andrypeb227@gmail.com",
    },
    {
      nama: "Bagad Ihwalubin",
      email: "bagadihwa@gmail.com",
    },
    {
      nama: "Edai Cyahyono",
      email: "cyahyadi@gmail.com",
    },
  ];

  res.render("index", {
    title: "Halaman Mahasiswa",
    layout: "layouts/main-layout",
    mahasiswa,
  });
});

// Halaman About //
app.get("/about", (req, res) => {
  res.render("about", {
    title: "Halaman About",
    layout: "layouts/main-layout",
  });
});

// Halaman Contact //
app.get("/contact", (req, res) => {
  // Mengambil semua Data Contact
  const contacts = loadContacts();

  res.render("contact", {
    title: "Halaman Contact",
    layout: "layouts/main-layout",
    contacts,
    success: req.flash("success"),
  });
});

// Halaman Tambah Data Contact //
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Form Tambah Data Contact",
    layout: "layouts/main-layout",
  });
});

// Proses Tambah Data Contact //
app.post(
  "/contact",
  [
    body("nama").custom((value) => {
      // Validasi nama duplikat
      const duplikat = checkDuplikat(value);
      if (duplikat) {
        throw new Error("Nama Contact sudah digunakan!");
      }
      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("nohp", "No HP tidak valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    // Mendapatkan error
    const errors = validationResult(req);
    // Jika validasi tidak sesuai
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        title: "Form Tambah Data Contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      addContact(req.body);
      // Mengirimkan flash message sebelum redirect
      req.flash("success", "Data Contact berhasil ditambahkan!");
      res.redirect("/contact");
    }
  }
);

// Form Edit Data Contact //
app.get("/contact/edit/:id", (req, res) => {
  const contact = findContact(req.params.id);

  // Jika Data Contact tidak ditemukan
  if (!contact) {
    res.status(404).send("<h1>404</h1>");
  }

  res.render("edit-contact", {
    title: "Form Edit Data Contact",
    layout: "layouts/main-layout",
    contact,
  });
});

// Proses Update Data Contact
app.post(
  "/contact/update/:id",
  [
    body("nama").custom((value, { req }) => {
      // Mengecek apakah data ada
      const contact = findContact(req.params.id);
      if (!contact) {
        throw new Error("Data Contact dengan Id tersebut tidak ada!");
      }

      // Mengecek apakah nama duplikat
      const duplikat = checkDuplikat(value);
      if (value !== contact.nama && duplikat) {
        throw new Error("Nama Contact sudah digunakan!");
      }

      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("nohp", "No HP tidak valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    // Mendapatkan error
    const errors = validationResult(req);
    req.body.id = req.params.id;
    // Jika validasi tidak sesuai
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "Form Edit Data Contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      updateContacts(req.body);
      // Mengirimkan flash message sebelum redirect
      req.flash("success", "Data Contact berhasil diubah!");
      res.redirect("/contact");
    }
  }
);

// Halaman Detail Contact
app.get("/contact/:id", (req, res) => {
  const contact = findContact(req.params.id);

  res.render("detail", {
    title: "Halaman Detail " + contact.nama,
    layout: "layouts/main-layout",
    contact,
  });
});

// Proses Delete Contact
app.get("/contact/delete/:id", (req, res) => {
  const contact = findContact(req.params.id);

  // Jika contact tidak ada
  if (!contact) {
    res.status(404).send("<h1>404</h1>");
  } else {
    deleteContact(contact.id);
    // Mengirimkan flash message sebelum redirect
    req.flash("success", "Data Contact berhasil dihapus!");
    res.redirect("/contact");
  }
});

// Middleware 404
app.use("/", (req, res) => {
  res.status(404).send("<h1>404 Not Found</h1>");
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
  console.log(`Go to: http://localhost:${port}`);
});
