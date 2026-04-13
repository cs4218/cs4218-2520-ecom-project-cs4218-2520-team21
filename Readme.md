# CS4218 Project - Virtual Vault

## 1. Project Introduction

Virtual Vault is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) e-commerce website, offering seamless connectivity and user-friendly features. The platform provides a robust framework for online shopping. The website is designed to adapt to evolving business needs and can be efficiently extended.

## 2. Website Features

- **User Authentication**: Secure user authentication system implemented to manage user accounts and sessions.
- **Payment Gateway Integration**: Seamless integration with popular payment gateways for secure and reliable online transactions.
- **Search and Filters**: Advanced search functionality and filters to help users easily find products based on their preferences.
- **Product Set**: Organized product sets for efficient navigation and browsing through various categories and collections.

## 3. Your Task

- **Unit and Integration Testing**: Utilize Jest for writing and running tests to ensure individual components and functions work as expected, finding and fixing bugs in the process.
- **UI Testing**: Utilize Playwright for UI testing to validate the behavior and appearance of the website's user interface.
- **Code Analysis and Coverage**: Utilize SonarQube for static code analysis and coverage reports to maintain code quality and identify potential issues.
- **Load Testing**: Leverage JMeter for load testing to assess the performance and scalability of the ecommerce platform under various traffic conditions.

## 4. Setting Up The Project

### 1. Installing Node.js

1. **Download and Install Node.js**:
   - Visit [nodejs.org](https://nodejs.org) to download and install Node.js.

2. **Verify Installation**:
   - Open your terminal and check the installed versions of Node.js and npm:
     ```bash
     node -v
     npm -v
     ```

### 2. MongoDB Setup

1. **Download and Install MongoDB Compass**:
   - Visit [MongoDB Compass](https://www.mongodb.com/products/tools/compass) and download and install MongoDB Compass for your operating system.

2. **Create a New Cluster**:
   - Sign up or log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
   - After logging in, create a project and within that project deploy a free cluster.

3. **Configure Database Access**:
   - Create a new user for your database (if not alredy done so) in MongoDB Atlas.
   - Navigate to "Database Access" under "Security" and create a new user with the appropriate permissions.

4. **Whitelist IP Address**:
   - Go to "Network Access" under "Security" and whitelist your IP address to allow access from your machine.
   - For example, you could whitelist 0.0.0.0 to allow access from anywhere for ease of use.

5. **Connect to the Database**:
   - In your cluster's page on MongoDB Atlas, click on "Connect" and choose "Compass".
   - Copy the connection string.

6. **Establish Connection with MongoDB Compass**:
   - Open MongoDB Compass on your local machine, paste the connection string (replace the necessary placeholders), and establish a connection to your cluster.

### 3. Application Setup

To download and use the MERN (MongoDB, Express.js, React.js, Node.js) app from GitHub, follow these general steps:

1. **Clone the Repository**
   - Go to the GitHub repository of the MERN app.
   - Click on the "Code" button and copy the URL of the repository.
   - Open your terminal or command prompt.
   - Use the `git clone` command followed by the repository URL to clone the repository to your local machine:
     ```bash
     git clone <repository_url>
     ```
   - Navigate into the cloned directory.

2. **Install Frontend and Backend Dependencies**
   - Run the following command in your project's root directory:

     ```
     npm install && cd client && npm install && cd ..
     ```

3. **Add database connection string to `.env`**
   - Add the connection string copied from MongoDB Atlas to the `.env` file inside the project directory (replace the necessary placeholders):
     ```env
     MONGO_URL = <connection string>
     ```

4. **Adding sample data to database**
   - Download “Sample DB Schema” from Canvas and extract it.
   - In MongoDB Compass, create a database named `test` under your cluster.
   - Add four collections to this database: `categories`, `orders`, `products`, and `users`.
   - Under each collection, click "ADD DATA" and import the respective JSON from the extracted "Sample DB Schema".

5. **Running the Application**
   - Open your web browser.
   - Use `npm run dev` to run the app from root directory, which starts the development server.
   - Navigate to `http://localhost:3000` to access the application.

## 5. Unit Testing with Jest

Unit testing is a crucial aspect of software development aimed at verifying the functionality of individual units or components of a software application. It involves isolating these units and subjecting them to various test scenarios to ensure their correctness.  
Jest is a popular JavaScript testing framework widely used for unit testing. It offers a simple and efficient way to write and execute tests in JavaScript projects.

### Getting Started with Jest

To begin unit testing with Jest in your project, follow these steps:

1. **Install Jest**:  
   Use your preferred package manager to install Jest. For instance, with npm:

   ```bash
   npm install --save-dev jest

   ```

2. **Write Tests**  
   Create test files for your components or units where you define test cases to evaluate their behaviour.

3. **Run Tests**  
   Execute your tests using Jest to ensure that your components meet the expected behaviour.  
   You can run the tests by using the following command in the root of the directory:
   - **Frontend tests**

     ```bash
     npm run test:frontend
     ```

   - **Backend tests**

     ```bash
     npm run test:backend
     ```

   - **All the tests**
     ```bash
     npm run test
     ```

## 6. MS1 CI URL

Link: https://github.com/cs4218/cs4218-2520-ecom-project-cs4218-2520-team21/actions/runs/22291437341/job/64479328858
The link above is the CI test run for Milestone 1.

## 7. Distribution of Work (MS1)

Each member has completed the testing for the following files:

#### Dhruvi Ketan Rathod

- components/AdminMenu.js
- pages/admin/AdminDashboard.js
- components/Form/CategoryForm.js
- pages/admin/CreateCategory.js
- pages/admin/CreateProduct.js
- pages/admin/AdminOrders.js
- controllers/categoryController.js
  - Only create, update and delete functions: test file is in controllers/categoryControllerBasic.test.js
- controllers/productController.js
  - Only create, update and delete functions: test file is in controllers/productControllerBasic.test.js

#### Paing Khant Kyaw

- context/auth.js
- helpers/authHelper.js
- middlewares/authMiddleware.js
- pages/Auth/Register.js
- pages/Auth/Login.js
- controllers/authController.js
  - registerController
  - loginController
  - forgotPasswordController
  - testController
- components/Footer.js
- components/Header.js
- components/Layout.js
- components/Spinner.js
- pages/About.js
- pages/Pagenotfound.js
- config/db.js
- e2e test scenarios
  - Scenario 7: user logs in, user views all product categories, user clicks on a particular category and views products of that category, user adds product to cart, user pays, check if reflected in orders
  - Scenario 9: User logs in, user goes to dashboard page, user deletes account, try to log back in → failure
- integration test
  - forgot.intgration.spec.js
  - login.integration.spec.js
  - register.integration.spec.js
  - loginController.integration.test.js
  - forgotPasswordController.integration.test.js
  - registerController.integration.test.js
  - Header.integation.js

#### Ariella Thirza Callista

- pages/ProductDetails.js
- pages/CategoryProduct.js
- pages/HomePage.js
- controllers/ProductController.js
  - tests can be found in `controllers/productController.test.js`
    - getProductController
    - getSingleProductController
    - productPhotoController
    - productFiltersController
    - productListController
    - productCountController
    - searchProductController
    - relatedProductController
    - productCategoryController

#### Lim Rui Ting Valencia

- components/Routes/Private.js
- components/UserMenu.js
- pages/user/Dashboard.js
- models/userModel.js
- pages/user/Orders.js
- controllers/authController.js
  - updateProfileController
  - getOrdersController
  - getAllOrdersController
  - orderStatusController
  - getAllUsersController (newly added due to bug fix)
- pages/user/Profile.js
- pages/admin/Users.js
- components/Form/SearchInput.js
- context/search.js
- pages/Search.js

#### Xenos Fiorenzo Anong

- pages/Contact.js
- pages/Policy.js
- pages/CartPage.js
- context/cart.js
- hooks/useCategory.js
- pages/Categories.js
- controllers/categoryController.js - my tests are in categoryController.test.js
  - categoryControlller
  - singleCategoryController

## 8. Distribution of Work (MS2)

Each member has completed the integration and UI testing for the following files:

#### Dhruvi Ketan Rathod

- e2e test scenarios
  - tests/scenario3.spec.js: Admin logs in, adds a new category, adds a new product using the new category, checks if product shows up under the created category
  - tests/scenario6.spec.js: User logs in, searches for a product, adds first product displayed to cart, adds a related product to cart, pays, checks if order reflected with 2 products
  - tests/scenario11.spec.js: Admin logs in, adds a new category, adds a new product using the new category, updates the category just created, checks if the same product shows up under the updated category name

- integration tests
  - controllers/categoryControllerBasic.integration.test.js
  - controllers/productControllerBasic.integration.test.js
  - client/src/pages/admin/CreateProduct.integration.test.js
  - client/src/pages/admin/AdminOrders.integration.test.js

#### Ariella Thirza Callista

- e2e test scenarios
  - `tests/scenario2.spec.js`: User logs in -> filter by category/price/both -> view product detail -> add to cart -> checkout and make payment -> user checks order
  - `tests/scenario4.spec.js`: Guest adds to cart from HomePage -> attempts checkout -> redirected to login -> User logs in -> continues and completes purchase

- integration tests
  - **HomePage** <-> CartContext, HomePage <-> CartPage, HomePage <-> express <-> MongoDB
  - **ProductDetails** <-> CartContext, ProductDetails <-> CartPage, ProductDetails <-> express <-> MongoDB
  - FE Integration Tests are found in
    ```
    client/src/pages/HomePage.integration.test.js
    client/src/pages/ProductDetails.integration.test.js
    ```
  - BE Integration Tests are found in
    ```
    controllers/integration-tests/homepage.backend.integration.test.js
    controllers/integration-tests/productdetails.backend.integration.test.js
    ```

#### Xenos Fiorenzo Anong

- e2e test scenarios
  - scenario 1: "user registers, user logs in, user adds product to cart, user pays, user checks order"
  - scenario 5: "user registers, user logs in, user adds multiple products to cart, user removes a product, user pays, user checks order"
  - scenario 12: "user registers, user logs in, user adds product to cart, user checks cart, user updates address"
- integration tests
  - cart page <-> cart context, auth context, search context
  - category page <-> useCategory hook

#### Lim Rui Ting Valencia

for both e2e test scenarios and integration tests done, refer to ms2 report. To test for my UI testing, please use the following command:
`PW_SKIP_WEBSERVER=1 E2E_ADMIN_EMAIL='admin@admin.com' E2E_ADMIN_PASSWORD='admin' npx playwright test --config=playwright.config.ts`

## 9. Distribution of Work (MS3)

Each member has completed the non-functional testing for the following files:

#### Xenos Fiorenzo Anong

- security testing - CI workflow
  - .github/workflows/scan.yaml
- jest security test cases: tests/security/\*
- bug fix: add pages/Auth/Forgot.js

#### Dhruvi Ketan Rathod

- tests/performance/spike/homepage_spike.js
- tests/performance/spike/login_spike.js
- tests/performance/spike/payment_spike.js
- tests/performance/spike/product_detail_spike.js
- Additionally html files were generated and stored in the tests/performance/spike folder for all four tests containing the tests' graphs and metrics

#### Paing Khant Kyaw

- test/load/braintree_payment_load_test.js
- test/load/braintree_token_load_test.js
- test/load/category_load_test.js
- test/load/home_page_test.js
- test/load/product_filters_load_test.js
- test/load/product_list_load_test.js
- test/load/search_load_test.js
- test/recovery/backend_crash_recovery_test.js
- Generated report html/json are under /reports folder

#### Ariella Thirza Callista 

Stress testing: everything under `tests/stress` directory
- tests/stress/helpers (all .js files in this directory)
- tests/stress/filter-stress.js
- tests/stress/login-stress.js
- tests/stress/payment-stress.js
- tests/stress/signup-stress.js
- Additionally, html files were generated containing its graphs and metrics under the tests/stress/reports folder

#### Lim Rui Ting Valencia

Soak Testing
- k6/scripts/soak-endurance-test.js
The soak test focused on four primary user flows:
  - browsing products (catalog retrieval),
  - searching products (keyword-based search),
  - category navigation (hierarchical data access), and
  - product detail with related products (full product page simulation).
