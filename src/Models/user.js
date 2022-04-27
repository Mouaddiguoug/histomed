export default class user{
    constructor (id, firstName, lastName, email, tel, password, role, image, createdAt) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.tel = tel;
        this.password = password;
        this.role = role;
        this.image = image;
        this.createdAt = createdAt;
    }
}