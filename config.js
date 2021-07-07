module.exports = {
    'port': process.env.PORT || 9000,

    'base_url': "",
    'database' : process.env.DATABASE_URL, //process.env.DATABASE_URL,

    'secret': 'XFH!P(0EV#HJF1X&4#VB5XWVJTTD)STWV6R$IYS6&%V80D9VL0M#N79%XR3BP&S$1C4IWU20W6U6HST5S32($S%8&06X)VOR!*^QTONN*FYPOP3#@UM5^2)C81MK9TK!14LQFO7!',
    'mail' : {
        'username': process.env.MAIL_USERNAME,
        'password': process.env.MAIL_PASSWORD,
        'host': process.env.MAIL_HOST,
        'port': process.env.MAIL_PORT,
        'sender': process.env.MAIL_USERNAME
    },

    'cloudinary': {
        'cloud_name': process.env.CLOUDINARY_CLOUD_NAME,
        'api_key': process.env.CLOUDINARY_API_KEY,
        'api_secret': process.env.CLOUDINARY_API_SECRET
    },
    generateCode: function () {
        var length = 10,
            charset = "01234567890ABCDEFGHIJKLMNOPQRSTUVWXY",
            retVal = "";
        for (var i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        return retVal;
    },

    validateEmail: function (email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    },

    checkImageSize: function (img) {
        const buffer = Buffer.from(img.substring(img.indexOf(',') + 1));
        
        return buffer.length/1e+6;
    }
}