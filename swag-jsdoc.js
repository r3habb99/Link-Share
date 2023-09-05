/**
 * @swagger
 * tags:
 *   name: File
 *   description: API for managing files
 */

/**
 * @swagger
 * /files/upload:
 *   post:
 *     summary: Upload a single file
 *     tags: [File]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification token sent to the user
 *     responses:
 *       200:
 *         description: File uploaded successfully
 */
/**
 * @swagger
 * /files/upload-multiple:
 *   post:
 *     summary: Upload multiple files (up to 5)
 *     tags: [File]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: files
 *         type: file
 *         required: true
 *         maxItems: 5
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 */
/**
 * @swagger
 * /files/getallfiles:
 *   get:
 *     summary: Get a list of all files
 *     tags: [File]
 *     responses:
 *       200:
 *         description: List of files
 */
/**
 * @swagger
 * /files/{id}:
 *   get:
 *     summary: Get a file by ID
 *     tags: [File]
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: File retrieved successfully
 */

/**
 * @swagger
 * tags:
 *   name: User
 *   description: API for user registration and authentication
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with the given email and password
 *     tags: [User]
 *     requestBody:
 *       description: User registration data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 verificationLink:
 *                   type: string
 *                 token:
 *                   type: string
 *
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Authenticate a user
 *     description: Verifies the user credentials and returns a token if valid
 *     tags: [User]
 *     requestBody:
 *       description: User login data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: string
 *                 token:
 *                   type: string
 *
 */
/**
 * @swagger
 * /users/verify/{userId}/{token}:
 *   get:
 *     summary: Verify user's email
 *     description: Verifies a user's email by checking the provided token
 *     tags: [User]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: User's ID
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification token sent to the user
 *     responses:
 *       200:
 *         description: User verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *
 */