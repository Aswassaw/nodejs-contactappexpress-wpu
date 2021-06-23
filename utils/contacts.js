// Import kebutuhan
const fs = require("fs");
const { nanoid } = require("nanoid");

// Membuat folder data jika belum ada
const dirPath = "./data";
!fs.existsSync(dirPath) ? fs.mkdirSync(dirPath) : null;

// Membuat file contacts jika belum ada
const dataPath = "./data/contacts.json";
!fs.existsSync(dataPath) ? fs.writeFileSync(dataPath, "[]") : null;

// Ambil semua data di contact.json
const loadContacts = () => {
  const file = fs.readFileSync("data/contacts.json", "utf-8"); // Membaca isi contacts.json
  return JSON.parse(file); // Parse string menjadi json
};

// Cari sebuah contact berdasarkan id
const findContact = (id) => {
  const contacts = loadContacts();
  const contact = contacts.find((contact) => contact.id === id);
  return contact;
};

// Menuliskan / menimpa file contacts.json dengan data yang baru
const saveContacts = (contacts) => {
  fs.writeFileSync("data/contacts.json", JSON.stringify(contacts));
};

// Menambahkan data contact baru
const addContact = (contact) => {
  const contacts = loadContacts();
  contact.id = nanoid(16);
  contacts.push(contact);

  saveContacts(contacts);
};

// Cek nama duplikat
const checkDuplikat = (nama) => {
  const contacts = loadContacts();
  return contacts.find((contact) => contact.nama === nama);
};

// Delete contact
const deleteContact = (id) => {
  const contacts = loadContacts();
  const filteredContacts = contacts.filter((contact) => contact.id !== id);

  saveContacts(filteredContacts);
};

// Update Contacts
const updateContacts = (contactBaru) => {
  const contacts = loadContacts();
  // Hilangkan contact lama yang idnya tidak sama dengan id contactBaru
  const filteredContacts = contacts.filter(
    (contact) => contact.id !== contactBaru.id
  );
  filteredContacts.push(contactBaru);

  saveContacts(filteredContacts);
};

module.exports = {
  loadContacts,
  findContact,
  addContact,
  checkDuplikat,
  deleteContact,
  updateContacts,
};
