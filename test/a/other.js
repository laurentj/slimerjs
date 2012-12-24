

function Identity(name) {
    this.firstName = name;
}

Identity.prototype = {
    get age() {
        return 20;
    },
    latestEmail: function () {
        return 'laurent@jelix.org'
    }   
}

exports.Identity = Identity;