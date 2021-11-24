const getSignup = async (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/')
    } else {
        res.render('signup');
    }
}

const postSignup = async (req, res) => {
    res.redirect('/');
}

const failedSignup = async (req, res) => {
    res.render('signup-error');
}

module.exports = {
    getSignup,
    postSignup,
    failedSignup
}