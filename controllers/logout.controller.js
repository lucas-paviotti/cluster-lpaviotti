const renderLogout = async (req, res) => {
    if (req.isAuthenticated()) {
        res.render('logout', { nombre: req.user.username });
        req.logout();
    }
}

module.exports = {
    renderLogout
}