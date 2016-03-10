(function (root) {
    var EMPTY = root.maze.EMPTY;
    var WALL = root.maze.WALL;
    var PATH = root.maze.PATH;
    var CURRENT = root.maze.CURRENT;
    var DIRECTION = root.maze.DIRECTION; /* направления шага */

    /**
     * Функция находит путь к выходу и возвращает найденный маршрут
     *
     * @param {number[][]} maze карта лабиринта представленная двумерной матрицей чисел
     * @param {number} x координата точки старта по оси X
     * @param {number} y координата точки старта по оси Y
     * @returns {[number, number][]} маршрут к выходу представленный списоком пар координат
     */
    function solution(maze, x, y, log) {
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

        function makePath() {
            return currentPath.map(function(pathRecord){
                return [pathRecord.x, pathRecord.y];
            });
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
                x: currentPosition.x + (direction == DIRECTION.right) - (direction == DIRECTION.left), // Number(true) -> 1; Number(false) -> 0;
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
            prevStepDirection = direction;  // сохраняем направление шага
        }

        /* делает шаг назад */
        function stepBack() {
            if (currentPath.length == 0) { // всё обошли и пришли в исходную точку
                throw ({message: 'Выход не найден.'});
            }
            var prevStepRecord = currentPath.pop(); //получаем запись о предыдущем шаге и извлекаем её из текущего пути
            var backDirection =                                     //получаем направление обратное направлению предыдущего шага
                (prevStepRecord.direction == DIRECTION.bottom && DIRECTION.top) + //false && x -> false; true && x -> x; Number(false) -> 0;
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
            if (currentPath[currentPath.length - 1]) {
                prevStepDirection = currentPath[currentPath.length - 1].direction; // сохраняем направление шага предествующего данной позиции, т.е. шага который в первый раз привел игрока в текущую точку.
            }
        }

        /* определяет направление следующего шага */
        function getNextStepDirection() {
            var canMoveBottom = canMove(DIRECTION.bottom);
            var canMoveRight = canMove(DIRECTION.right);
            var canMoveTop = canMove(DIRECTION.top);
            var canMoveLeft = canMove(DIRECTION.left);
            if (canMoveBottom + canMoveRight + canMoveTop + canMoveLeft > 1) { // Number(true) -> 1; Number(false) -> 0;
                prevChoisePoint = currentPosition;  // сохраняем последнюю точку в которой был выбор
            }
            var canMovePrevDirection =                            // определяем можно ли двигаться в прежнем направлении
                (prevStepDirection == DIRECTION.bottom && canMoveBottom) + //false && x -> false; true && x -> x; Number(false) -> 0;
                (prevStepDirection == DIRECTION.top && canMoveTop) + 
                (prevStepDirection == DIRECTION.left && canMoveLeft) + 
                (prevStepDirection == DIRECTION.right && canMoveRight);
            if (canMovePrevDirection) { //проверяем возможность движения по старому направлению
                return prevStepDirection;
            } else if (canMoveBottom) { //проверяем возможность движения вниз
                return DIRECTION.bottom;
            } else if (canMoveRight) { //проверяем возможность движения вправо
                return DIRECTION.right;
            } else if (canMoveTop) { //проверяем возможность движения вверх
                return DIRECTION.top;
            } else if (canMoveLeft) { //проверяем возможность движения влево
                return DIRECTION.left;
            } else {                  //зашли в тупик - делаем шаг назад
                return DIRECTION.back;
            }
        }

        /* условие выхода из лабиринта, возвращает true если выход найден */
        function foundExit() {
            return currentPosition.y == maze.length - 1;
        }

        try {
            currentPosition = {x: x, y: y};
            if (isEdge(currentPosition)) {
                throw ({message: "Некорректные параметры: стартовая точка за краем лабиринта."});
            }
            if (isWall(currentPosition)) {
                throw ({message: "Некорректные параметры: стартовая точка находится на стене."});
            }
            prevStepDirection = DIRECTION.bottom;
            while (!foundExit()) { //цикл завершается если выход найден или через исключение
                var direction = getNextStepDirection(); // получаем направление след шага
                if (direction == DIRECTION.back) {
                    stepBack(); // шаг назад
                } else {
                    makeStep(direction); // шаг в направлении direction
                }
            }
            var logRecord = { // ещё один шаг к выходу
                x: currentPosition.x,
                y: currentPosition.y,
                direction: prevStepDirection
            }
            currentPath.push(logRecord);
            pathLog.push(logRecord);
            log.pathLog = pathLog;
            return makePath();
        } catch (e) {
            console.log(e);
            alert(e.message);
            log.pathLog = pathLog;
            return makePath();
        }
    }

    root.maze.solution = solution;
})(this);
