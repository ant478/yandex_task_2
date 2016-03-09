(function (root) {
    var EMPTY = root.maze.EMPTY;
    var WALL = root.maze.WALL;
    var PATH = root.maze.PATH;
    var CURRENT = root.maze.CURRENT;


    /**
     * Функция находит путь к выходу и возвращает найденный маршрут
     *
     * @param {number[][]} maze карта лабиринта представленная двумерной матрицей чисел
     * @param {number} x координата точки старта по оси X
     * @param {number} y координата точки старта по оси Y
     * @returns {[number, number][]} маршрут к выходу представленный списоком пар координат
     */
    function solution(maze, x, y) {
        /* направления шага */
        var DIRECTION = {
            back: -1,
            top: 0,
            right: 1,
            bottom: 2,
            left: 3
        }

        /* полный лог передвижений игрока  */
        var pathLog = [];

        /* текущий пройденный путь с учетом движения назад  */
        var currentPath = [];

        /* текущие координаты игрока */
        var currentPosition = {};

        /* координаты последней пройденной точки на которой было более одного варианта направления следующего шага */
        var prevChoisePoint = {};

        /* направление последнего шага игрока */
        var prevStepDirection = 0;

        /* возвразает путь в формате {[number. number][]} */
        function makePath() {
            var result = [];
            for (var i = 0; i <= currentPath.length - 1; i++) {
                result.push([currentPath[i].x, currentPath[i].y]);
            }
            return result;
        }

        /* возвращает true если точка с координатами x, y за краем лабиринта */
        function isEdge(point) {
            return point.x < 0 || point.x > maze[0].length - 1 || point.y < 0 || point.y > maze.length - 1;
        }

        /* возвращает true если игрок уже находился в этой точке */
        function isPassed(point) {
            var result = false;
            var i = 0;
            while (!result && i <= pathLog.length - 1) {
                result = result || (pathLog[i].x == point.x && pathLog[i].y == point.y);
                i++;
            }
            return result;
        }

        /* возвращает true если в этой точке расположена стена */
        function isWall(point) {
            return maze[point.y][point.x] == WALL;
        }

        /* получает координаты точки после шага в направлении direction от текущей */
        function getNewPosition(direction) {
            var newPosition = {
                x: currentPosition.x + (direction == DIRECTION.right) - (direction == DIRECTION.left),
                y: currentPosition.y + (direction == DIRECTION.bottom) - (direction == DIRECTION.top)
            }
            return newPosition;
        }

        /* определяет можно ли двигаться в направлении direction */
        function canMove(direction) { 
            var newPosition = getNewPosition(direction);
            return !isEdge(newPosition) && !isWall(newPosition) && !isPassed(newPosition);
        }

        /* делает шаг в направлении direction */
        function makeStep(direction) {
            var logRecord = {
                x: currentPosition.x,
                y: currentPosition.y,
                direction: direction
            };
            pathLog.push(logRecord); // сохраняем запись о перемещении в лог перемещений и в текущий путь
            currentPath.push(logRecord);
            currentPosition = getNewPosition(direction); // получаем новую позицию игрока
        }

        /* делает шаг назад */
        function stepBack() {
            var prevStepRecord = currentPath.pop(); //получаем запись о предыдущем шаге и извлекаем её из текущего пути
            var backDirection =                                     //получаем направление обратное направлению предыдущего шага
                (prevStepRecord.direction == DIRECTION.bottom && DIRECTION.top) + 
                (prevStepRecord.direction == DIRECTION.top && DIRECTION.bottom) + 
                (prevStepRecord.direction == DIRECTION.left && DIRECTION.right) + 
                (prevStepRecord.direction == DIRECTION.right && DIRECTION.left);
            var logRecord = {
                x: currentPosition.x,
                y: currentPosition.y,
                direction: backDirection
            };
            pathLog.push(logRecord); //сохраняем запись о перемещении в лог
            currentPosition = getNewPosition(backDirection); // получаем новую позицию игрока
        }

        /* определяет направление следующего шага */
        function getNextStepDirection() {
            if (canMove(prevStepDirection)) { //проверяем возможность движения по старому направлению
                return prevStepDirection;
            } else if (canMove(DIRECTION.bottom)) { //проверяем возможность движения вниз
                return DIRECTION.bottom;
            } else if (canMove(DIRECTION.right)) { //проверяем возможность движения вправо
                return DIRECTION.right;
            } else if (canMove(DIRECTION.top)) { //проверяем возможность движения вверх
                return DIRECTION.top;
            } else if (canMove(DIRECTION.left)) { //проверяем возможность движения влево
                return DIRECTION.left;
            } else {                              //зашли в тупик - делаем шаг назад
                return DIRECTION.back;
            }
        }


        /* возвращает true если есть более одного варианта след шага */
        function hasChoise() {
            var possibleDirectionsCount = 
                canMove(DIRECTION.bottom) +
                canMove(DIRECTION.right) +
                canMove(DIRECTION.top) +
                canMove(DIRECTION.left);
            return possibleDirectionsCount > 1;
        }

        /* условие выхода из лабиринта, возвращает true если выход найден */
        function foundExit() {
            return currentPosition.y == maze.length - 1;
        }

        try {
            currentPosition = {x: x, y: y};
            prevStepDirection = DIRECTION.bottom;
            while (!foundExit()) { //цикл завершается если выход найден или через исключение
                if (hasChoise()) {
                    prevChoisePoint = currentPosition; // сохраняем последнюю точку в которой был выбор
                }
                var direction = getNextStepDirection(); // получаем направление след шага
                if (direction == DIRECTION.back) {
                    stepBack(); // шаг назад
                } else {
                    makeStep(direction); // шаг в направлении direction
                }
            }
            currentPath.push({
                x: currentPosition.x,
                y: currentPosition.y,
                direction: DIRECTION.back
            });
            return makePath();
        } catch (e) {
            console.log(e);
            alert(e.message);
            return [];
        }
    }

    root.maze.solution = solution;
})(this);
