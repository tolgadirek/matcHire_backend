const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger"); // Winston logger

// Kullanıcı kayıt işlemi
const register = async (req, res) => {
  const { firstName, lastName, email, password, role, companyName } = req.body;

  logger.info(`Register attempt: ${email}`);

  try {
    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Şifre uzunluğu kontrolü
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long.",
      });
    }

    // Email zaten var mı kontrolü
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      logger.warn(`Registration failed - email already exists: ${email}`);
      return res.status(400).json({ message: "Email already exists." });
    }

    // Şifre hashleme
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcı oluşturma
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role, // "seeker" veya "employer"
        companyName: role === "employer" ? companyName : null,
      },
    });

    // JWT token oluşturma
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.SECRET_TOKEN,
      { expiresIn: "1d" }
    );

    // Şifreyi response’tan çıkar
    const { password: _, ...userData } = newUser;

    logger.info(`User registered successfully: ${email}`);

    return res.status(201).json({
      status: "Created",
      user: userData,
      token,
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
};

// Kullanıcı giriş işlemi
const login = async (req, res) => {
  const { email, password } = req.body;

  logger.info(`Login attempt: ${email}`);

  try {
    // Kullanıcı var mı kontrolü
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logger.warn(`Login failed - user not found: ${email}`);
      return res.status(404).json({ message: "User not found." });
    }

    // Şifre karşılaştırma
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn(`Login failed - invalid password: ${email}`);
      return res.status(401).json({ message: "Invalid password." });
    }

    // JWT token oluşturma
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.SECRET_TOKEN,
      { expiresIn: "1d" }
    );

    // Şifreyi response’tan çıkar
    const { password: _, ...userData } = user;

    logger.info(`Login successful: ${email}`);

    return res.status(200).json({
      status: "Ok",
      user: userData,
      token,
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  const userId = req.user.id;

  logger.info(`Get profile for user Id: ${userId}`);

  try{
    const existingUser = await prisma.user.findUnique({
      where: {id: userId},
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        companyName: true,
        createdAt: true,
        cv: { select: { filePath: true, originalName: true, updatedAt: true } }
      }
    });

    if (!existingUser) {
      logger.warn(`User not found in profile fetch: ${userId}`);
      return res.status(404).json({message: "User not found"});
    }

    if (existingUser.role !== "employer") {
      existingUser.companyName = null;
    }

    return res.status(200).json({
      status: "Ok",
      user: existingUser
    });

  } catch (e) {
      logger.error(`Get profile error: ${e.message}`);
      return res.status(500).json({ message: e.message });
  }
}

const update = async (req, res) => {
    const userId = req.user.id;
    const { firstName, lastName, email, password, role, companyName } = req.body

    logger.info(`Update request for user ID: ${userId}`);

    try {
      const existingUser = await prisma.user.findUnique({
        where: {id: userId}
      });

      if (!existingUser) {
        return res.status(404).json({ message: "User not found." });
      }

      if (!firstName || !lastName || !email || !role) {
        return res.status(400).json({ message: "Enter valid data." });
      }

      if (role == "employer" && !companyName) {
        return res.status(400).json({ message: "Enter valid data." });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //Emaili formatı kontrolü
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format." });
      }

      if (email !== existingUser.email) {
        const emailExist = await prisma.user.findUnique({where: {email}});
        if (emailExist) {
          logger.warn(`Update failed - email already in use: ${email}`);
          return res.status(400).json({ message: "This email is already in use." });
        }
      }

      const updateData = {
        firstName,
        lastName,
        email,
        role,
        companyName: role === "employer" ? companyName : null
      }

      // Şifre boş değilse güncelle
      if (password && password.length > 0) {
          if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long." });
          }
          const hashedPassword = await bcrypt.hash(password, 10);
          updateData.password = hashedPassword;
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      //Json formatında veriler gönderilip alınırken json içinde password gözükmesin diyoruz. Güvenlik için.
      //Ama veritabanına hashlanmiş şekilde veri gönderilir ve kaydedilir.
      updatedUser.password = undefined;

      logger.info(`User updated: ${email}`);

      return res.status(200).json({
        status: "Updated",
        user: updatedUser,
      });

    } catch (e) {
      logger.error(`Update error: ${e.message}`);
      return res.status(500).json({message: e.message});
    }
}

module.exports = { register, login, getProfile, update };
