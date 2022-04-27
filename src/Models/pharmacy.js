export default class pharmacy{
    constructor (id, name, email, tel, password, valid, address, role, image, createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.tel = tel;
        this.password = password;
        this.valid = valid;
        this.address = address;
        this.role = role;
        this.image = image;
        this.createdAt = createdAt;
    }
}