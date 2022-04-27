export default class doctor{
    constructor (id, firstName, lastName, email, tel, password, city, valid, office, role, image, rate, patientsNumber, categories, createdAt) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.tel = tel;
        this.password = password;
        this.city = city;
        this.valid = valid;
        this.office = office;
        this.role = role;
        this.image = image;
        this.rate = rate;
        this.patientsNumber = patientsNumber; 
        this.categories = categories;
        this.createdAt = createdAt;
    }
}