# HolderSnap - Token snapshots made simple

### Dev Setup

#### Backend
1. Install dependencies
  ```
  $ poetry install
  ```
2. Run migrations
  ```
  $ poetry run python manage.py migrate
  ```
3. Run Redis (and leave open while running server)
  ```
  $ docker run -p 6379:6379 redis
  ```
4. Run Celery (and leave open while running server)
  ```
  $ celery -A holdersnap worker -l INFO
  ```
5. Run server
  ```
  $ poetry run python manage.py runserver
  ```

#### Frontend
1. Install dependencies
  ```
  $ yarn
  ```
2. Run app
  ```
  $ yarn start
  ```
