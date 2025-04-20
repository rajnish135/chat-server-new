const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");

async function userDetails(request, response) {
  try {
    // Try getting token from Authorization header
    const authHeader = request.headers.authorization || "";
    let token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : "";

    // If not found in header, try from cookies
    if (!token && request.cookies?.token) {
      token = request.cookies.token;
    }

    // Use token

    const user = await getUserDetailsFromToken(token);

    return response.status(200).json({
      message: "user details",
      data: user,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
    });
  }
}

module.exports = userDetails;
