const getLogin = async (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/')
    } else {
        res.render('login-facebook');
    }
}

const postLogin = async (req, res) => {
    res.redirect('/');
}

const failedLogin = async (req, res) => {
    res.render('login-error');
}

module.exports = {
    getLogin,
    postLogin,
    failedLogin
}