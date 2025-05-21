# A game created and played in 20 minutes by two friends bored in a bar.

# Reflex Duel

A touchscreen-based game where two players test their reflex speed on the same device.

## Features

- Two-player local multiplayer support
- Touch screen optimization
- Precise timing system
- Scoring based on reaction time
- Visual and auditory feedback
- Early touch penalty system

## Technical Details

### Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- Touch Events API
- RequestAnimationFrame API

#### System Requirements

- Multi-touch supported display (Microsoft Surface or similar)
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Installation

1. Clone the project:
```bash
git clone https://github.com/kullanici/refleks-kapmaca.git
```

2. Go to the project directory:
``bash
cd reflex-puzzle
```

3. Run the project with a web server (for example with Python):
```bash
python -m http.server 8000
```

4. Open `http://localhost:8000` in your browser

## Game Rules

1. The game consists of 10 rounds
2. After a random time in each round, a target appears on the screen
3. When the target appears, the first player to touch it scores points
4. Player who touches before the target appears gets a penalty point
5. Score is calculated based on reaction time (maximum 1000 points)
6. The player with the most points wins

## Developer Notes

#### Code Structure

- `index.html`: Main HTML structure
- `style.css`: All style definitions
- `game.js`: Game logic and interactions

#### Important Functions

- `startGame()`: Starts the game
- `startRound()`: Starts a new round
- `handleTouch()`: Handles touch events
- `isTargetHit()`: Performs a target hit check
- `awardPoints()`: Points calculation and awarding
- `preciseTimeout()`: Use of RAF for precise timing

## License

MIT License
