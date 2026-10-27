# DreamSpaceHub (Django)

    py -m venv venv
    venv\Scripts\activate
    pip install -r requirements.txt
    py manage.py makemigrations hub
    py manage.py migrate
    py manage.py createsuperuser
    py manage.py runserver

Pages: / , /journey/ , /experience/ , /services/ (+ one page per service) , /who-we-serve/ (+ one page per field) , /why-us/ , /franchise/ , /contact/
Enquiries appear in /admin/. Copy and 3D layouts live in hub/content.py.

3D engine (hub/static/hub/js/projection.js): every scene is a first-person walkthrough. The camera builds the space, then walks in through the front door.
Brightness knobs are in the LOOK object at the top of projection.js. Theme colours are the CSS variables at the top of site.css.
