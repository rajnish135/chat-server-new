async function logout(req, res) {
    try {

        // Clear the cookie named "token"
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,             //    Only set this to true if you're using HTTPS
            
        });

        return res.status(200).json({
            message: "Cookie deleted successfully",
            logout: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

module.exports = logout;
