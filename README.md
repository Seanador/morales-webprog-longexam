# CTWEBPGL Web Programming - Long Exam 1

This repository contains a React frontend built with Vite, React Router, and Tailwind CSS.

The current project is **BulldogEx Shop**, a low-fidelity e-commerce wireframe for campus products. It includes a full-width hero banner, product catalog cards, product detail pages, store information pages, shared layouts, and authentication screens.

## Tech Stack

- React 19
- Vite
- React Router DOM
- Tailwind CSS 4
- ESLint

## Main Features

- Full-width e-commerce hero section with background image overlay
- Product listing page with reusable product cards
- Product detail page with price, category, stock, description, and action buttons
- Store-focused home, about, footer, and not found pages
- Authentication pages for sign in and sign up
- Shared layout, navbar, footer, and button components

## Fork and Clone Instructions

Fork the original repository first on GitHub. This creates your own copy of the repository under your GitHub account.

After the repository is forked, clone your forked repository to your local device:

1. Go to the root folder where you want to save the project.
2. Open that folder in **VS Code**.
3. Open the **VS Code Terminal**.
4. Run `git clone` using the URL of your forked repository:

```bash
git clone <forked-repository-url>
```
Example:

```bash
git clone https://github.com/your-username/surname-long-exam.git
```

After cloning the forked repository, go inside the cloned project folder:

```bash
cd surname-long-exam
```

## Project Setup

Install dependencies inside the client app:

```bash
cd surname-client
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

## Push to GitHub Using Git Bash

Open **Git Bash** or **VS Code Terminal**, then go to the project root folder:

Example
```bash
cd /c/Users/ACER/Desktop/cy.dev/cy.dev.reactjs/course-material/webprog/long-exam1
```

Check the files before committing:

```bash
git status
```

If this folder is not yet a Git repository, initialize it:

```bash
git init
```

Stage, commit, and push the project:

```bash
git add .
git commit -m "initial long-exam1"
git push origin main
```

For future updates after editing files:

```bash
git status
git add .
git commit -m "enhanced long-exam1"
git push
```

## Server and Client Integration

This project is divided into two parts: `morales-client` for the website that users see, and `morales-server` for the API and database work. The client sends requests to the server using the browser's `fetch` function. For example, it requests products, creates an account, logs a user in, and sends cart or order information to the API.

The server receives these requests through Express routes, checks the request when needed, and then reads or updates the MongoDB database through Mongoose. It sends the result back as JSON, which the React pages use to update what is shown on screen. CORS is enabled on the server so the client and server can run on different local ports while developing.

When a user signs in, the server returns a token. The client saves the token in local storage and includes it in requests that need a logged-in user, such as viewing orders or managing products. The server checks the token before allowing those actions.

## Libraries and Packages Used

### Client

- **React** builds the user interface using reusable components such as the navbar, footer, product card, and buttons.
- **Vite** runs the client quickly during development and creates the final production build.
- **React Router DOM** handles page navigation for the home page, products, authentication pages, cart, orders, and dashboard without reloading the whole site.
- **Tailwind CSS** is used for styling the pages with ready-to-use utility classes.
- **ESLint** checks the JavaScript and React code for common mistakes and keeps the code style more consistent.

### Server

- **Express** creates the API endpoints that the client calls.
- **Mongoose** connects the server to MongoDB and defines the structure of data such as users, products, categories, carts, orders, suppliers, and reviews.
- **dotenv** loads private values, like the MongoDB connection string and JWT secret, from the server `.env` file.
- **bcryptjs** hashes user passwords before they are stored in the database.
- **jsonwebtoken** creates and checks login tokens for protected actions.
- **cors** allows the client application to communicate with the API during development.
- **nodemon** restarts the server automatically after code changes while developing.

## Design Pattern Used

On the client side, the project follows a component based design. Reusable parts of the interface are kept in the `components` folder, while complete screens are placed in `pages`. The `layouts` folder keeps the shared page structure; for example, the main layout contains the common navigation and footer, while the auth layout is used for sign-in and sign-up pages. React Context is used in `AuthContext` so login information can be shared by different pages without passing it through many components. Route guards such as `RequireAdmin` and `RequireCustomer` protect pages based on the user's role.

On the server side, the project follows a **route-controller-model design**. Routes decide which URL and HTTP method should be handled. Controllers contain the main action, such as getting products or creating an order. Models describe how each type of data is stored in MongoDB. Middleware is placed between the request and controller when the server needs to check a user's token or role first. This separation makes each file easier to understand and update.

## Project File Outline

```text
morales-webprog-longexam/
├── README.md
├── morales-client/                         # React user interface
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── App.jsx                         
│   │   ├── main.jsx                        # React starting point
│   │   ├── assets/                         # Images, styles, and API helper files
│   │   │   ├── cart-content.js
│   │   │   ├── order-content.js
│   │   │   ├── product-content.js
│   │   │   ├── hero.png
│   │   │   ├── react.svg
│   │   │   ├── vite.svg
│   │   │   ├── styles/
│   │   │   │   └── index.css
│   │   │   └── img/
│   │   │       ├── nu_bulldogex_banner.jpg
│   │   │       ├── nubdexchange_logo.png
│   │   │       ├── NU_athletics_V1.webp
│   │   │       ├── NU_backToBackChamps.webp
│   │   │       ├── NU_baseballTee.webp
│   │   │       ├── NU_basketballTee_V2.webp
│   │   │       ├── NU_bulldogsHoodie.webp
│   │   │       ├── NU_footballAdults.webp
│   │   │       ├── NU_ladyBulldogsVolleyball.webp
│   │   │       ├── NU_ladyBulldogsVolleyball_V1.webp
│   │   │       ├── NU_ladyBulldogsVolleyball_V3.webp
│   │   │       ├── NU_lanyard.webp
│   │   │       ├── NU_retroShirt_V2.webp
│   │   │       ├── NU_scarf_V2.webp
│   │   │       ├── NU_stickerPack.webp
│   │   │       ├── NU_sweatShirt.webp
│   │   │       ├── NU_TShirt_V2.webp
│   │   │       └── NU_waterbottle.jpg
│   │   ├── components/                     # reusable UI and protected-route components
│   │   │   ├── Button.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── NavBar.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductList.jsx
│   │   │   ├── RequireAdmin.jsx
│   │   │   └── RequireCustomer.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx             # shared login session and user role
│   │   ├── layouts/                        # shared page layouts
│   │   │   ├── AuthLayout.jsx
│   │   │   └── Layout.jsx
│   │   ├── pages/
│   │   │   ├── NotFoundPage.jsx
│   │   │   ├── AdminPages/
│   │   │   │   └── DashboardPage.jsx
│   │   │   ├── AuthPages/
│   │   │   │   ├── SignInPage.jsx
│   │   │   │   └── SignUpPage.jsx
│   │   │   └── LandingPages/
│   │   │       ├── AboutPage.jsx
│   │   │       ├── CartPage.jsx
│   │   │       ├── HomePage.jsx
│   │   │       ├── OrdersPage.jsx
│   │   │       ├── ProductListPage.jsx
│   │   │       └── ProductPage.jsx
└── morales-server/                         # Express API and MongoDB connection
    ├── package.json
    ├── package-lock.json
    ├── server.js                           # server starting point
    ├── config/                             # environment, database, and constants
    │   ├── config.js
    │   ├── constants.js
    │   └── db.js
    ├── controllers/                        # application business logic
    │   ├── cartController.js
    │   ├── categoryController.js
    │   ├── orderController.js
    │   ├── productController.js
    │   ├── reviewController.js
    │   ├── supplierController.js
    │   └── userController.js
    ├── middleware/                         # token and role authentication
    │   └── authMiddleware.js
    ├── models/                             # MongoDB data structures and schema
    │   ├── cartModel.js
    │   ├── categoryModel.js
    │   ├── orderModel.js
    │   ├── productModel.js
    │   ├── reviewModel.js
    │   ├── supplierModel.js
    │   └── userModel.js
    ├── routes/                             # API routes
    │   ├── cartRoutes.js
    │   ├── categoryRoutes.js
    │   ├── orderRoutes.js
    │   ├── productRoutes.js
    │   ├── reviewRoutes.js
    │   ├── supplierRoutes.js
    │   └── userRoutes.js
    
```
