# Task Manager Backend

## Overview

This repository contains a backend part of the Task-Manager project. The application is powered by Express and leverages MongoDB for data storage with mongoose as the Object Data Modeling (ODM) layer. This RESTful API handles all core functionalities, including creating and editing boards, columns, and tasks, while securely managing user authentication. With a focus on performance and scalability, the server-side implementation ensures robust data handling and provides a solid foundation for future expansions and integrations.

### Features

RESTful API: Handles creating and editing boards, columns, and tasks securely.

User Authentication: Implements robust authentication to manage user sessions.

Performance & Scalability: Designed for efficient data handling and prepared to support future integrations.


### Tech Stack

Express

MongoDB (with Mongoose ODM)

#### Installation

Node.js (v20 or higher recommended)

Clone the repository:

git clone https://github.com/FrontFeodot/task-manager-backend.git

cd task-manager-backend

Install dependencies:

npm install

npm start

Project require .env file with JWT token, MongodDB uri and server port

The application is available at this link: https://frontfeodot-task-manager.netlify.app