# The Executor

This is the code execution service for my toy remote code execution engine. I decided to write the code executing part in rust mainly because I want to get better at it, and rust seems like a really fun language :) This is still in progress.

## TODO

- [x] Make sure to handle errors during submitting results to the DB
- [x] Come up with a way to post submission results efficiently
- [x] Add other languages
- [ ] Instead of number, use int or float for better compatibility with better languages

## How to set it up.

### 1. Clone the repo

```
git clone git@github.com:KhachikAstoyan/toy-rce-executor.git
```

### 2. Install docker

Follow [this](https://docs.docker.com/engine/install/) tutorial if you still don't have docker installed

### 3. Run the project

```
cargo run
```
