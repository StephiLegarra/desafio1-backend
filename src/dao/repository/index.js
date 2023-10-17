import Contacts from "../factory.js";
console.log(Contacts);

import ContactsRepository from "./contacts.repository.js";

export const ContactsService = new ContactsRepository(new Contacts());