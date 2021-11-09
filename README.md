[![FPLogo](http://static.formpress.org/images/logo.png)](https://formpress.org/)

# Open Source Form Builder With Safe Data Collection

FormPress is an **innovative**, and **open source** form builder which lets you safely collect data through custom forms. Awesome!

# Features

- Simple yet modern UI
- Drag and drop elements
- File submission

# Technologies

FormPress is a combination of;

- [node.js] - the ubiquitous JS framework for backend chores
- [Express] - convenient Node.js web app framework
- [React] - quite popular JS library for the frontend
- [MySQL] - for the database management

# Installation

## Docker

Deployment of FormPress is fairly easy. So as to create the required images and run the containers:

```sh
cd formpress
docker-compose up
```

And that's it. To verify that the process ran smoothly, in your browser, please navigate to:

```sh
http://localhost:3000
```

## Enviroment Variables

To get the full experience of FormPress in terms of its features, a number of enviroment variables has to be set. Nevertheless, the app will run just fine but with fewer features.

Enviromental variables are added by adding lines to **.env** file in **formpress** root directory. Open **.env** file (_if it does not exist, you can create one_) with your favourite text editor and add the following lines:

#### **1. JSON Web Token**

This variable is _essential_ for the login. It can be set to anything, in this example we've set it to **SOMESUPERHARDTOGUESSSECRET**. Seriously.

```sh
JWT_SECRET=SOMESUPERHARDTOGUESSSECRET
```

#### **2. SendGrid**

For the time being, FormPress uses SendGrid fot the mail delivery.

```sh
SENDGRID_API_KEY=SENDGRIDAPIKEY
```

Features disabled if this variable is unset:

- Verification e-mail during sign-up
- Password reset e-mail
- Submission notification e-mail to the form owner

#### **3. Google Service Account Credentials**

This variable is the path to the local OAuth2 credentials file. This is required to authenticate Google Cloud Platform.

```sh
GOOGLE_SERVICE_ACCOUNT_CREDENTIALS=base64encodedserviceaccountjsonfile
```

Features disabled if this variable is unset:

- File upload element in forms

#### **4. Google Service Client ID**

FormPress login page offers Google Sign-In as an alternative (which will be discontinued as of March 31, 2023.)

```sh
GOOGLE_CREDENTIALS_CLIENT_ID=googleLoginClientID
```

Features disabled if this variable is unset:

- Google Sign-In

#### **5. File Upload Bucket**

File uploads in forms are stored in Google Cloud Storage. This variable is required for

```sh
FILE_UPLOAD_BUCKET=BUCKET
```

Features disabled if this variable is unset:

- File upload

## License

FormPress is licensed under [GPLv3](LICENSE)

[//]: # 'Links'
[react]: http://reactjs.org
[node.js]: http://nodejs.org
[express]: http://expressjs.com
[mysql]: http://mysql.com
