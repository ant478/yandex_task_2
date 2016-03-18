(function (root) {
    var EMPTY = root.maze.EMPTY;
    var WALL = root.maze.WALL;
    var PATH = root.maze.PATH;
    var CURRENT = root.maze.CURRENT;
    var DIRECTION = root.maze.DIRECTION; /* направления шага игрока */

    /**
     * Функция находит путь к выходу и возвращает найденный маршрут
     * Алгоритм иммитирует передвижение в лабиринте человека с завязанными глазами (далее - игрока). Игрок может двигаться 
     * вниз, вверх, влево или вправо на 1 клетку, может определять есть ли на соседней клетке стена 
     * (т.е. передвигается на ощупь), и может определить нашел ли он выход. (в целях контроля ошибок игроку были 
     * добавлены возможности чувствовать что он находится за краем лабиринта, а также что его в самом начале телопортировали в стену)
     * Человек, передвигающийся по лабиринту вслепую, скорее всего будет двигаться в одном направлении, пока не наткнется на стену.
     * Затем он на ошупь определит в каком направлении можно продолжать движение и пойдет в ту сторону до следующей стены и так далее.
     * В случае если он зайдет в тупик, он вернется к последней развилке, и пойдет в ту сторону, в какую ещё не ходил. Если же и там 
     * он найдет тупик, он снова вернется к последней развилке. Если он испробовал все направления движения от последней развилки - 
     * он вернется к предпоследней и пойдет в ту сторону в какую ещё не ходил, и так далее. Таким образом, обход лабиринта
     * можно представить как рекурсивный алгоритм вида:
     *   действие осмотреться() {
     *       если (выход_найден) {
     *           выйти_из_лабиринта();
     *       } иначе если (можно_двигаться_в_прежнем направлении) { // под "можно" подразумевается что на соседней 
     *           сделать шаг в прежнем направлении();               // клетке не стена и игрок там ещё не был
     *           осмотреться();
     *       } иначе если (можно_двигаться_вправо) {
     *           сделать_шаг_вправо();
     *           осмотреться();
     *       } иначе если (можно_двигаться_вниз) {
     *           сделать_шаг_вниз();
     *           осмотреться();
     *       } иначе если (можно_двигаться_влево) {
     *           сделать_шаг_влево();
     *           осмотреться();
     *       } иначе если (можно_двигаться_вверх) {
     *           сделать_шаг_вверх();
     *           осмотреться();
     *       } иначе если (не_в_исходной_точке){
     *           вернуться_вернуться_к_предыдущей_развилке();
     *       } иначе {
     *           остаться_в_лабиринте навсегда();
     *       }
     *   }
     *  Таким образом, по аналогии с алгоритмом заливки, игрок, передвигающийся по такому алгоритму, найдет выход, если он есть.
     *  если же выхода из лабиринта нет - игрок обойдет все возможное места и вернется в исходную точку. (В примерах из файла 
     *  const.js работа алгоритма лучше всего видна на картах с большим количеством развилок) В моей реализации, вместо рекурсии
     *  используется стек (переменная currentPath), в который помещаются данные о сделаных игроком шагах. Данные извлекаются если 
     *  игрок двигается назад. Эта переменная имеет и другое назначение - в конце выполнения алгоритма в стеке окажется результирующий 
     *  путь, т.е. такой, будто игрок всегда выбирал правильной направление и не двигался назад. Также, для последующего использования
     *  все данные о шагах игрока, в том числе и назад, хранятся в переменной pathLog - полный лог передвижений игрока.
     * 
     * @param {number[][]} maze карта лабиринта представленная двумерной матрицей чисел
     * @param {number} x координата точки старта по оси X
     * @param {number} y координата точки старта по оси Y
     * @param {object} log объект, в поле pathLog которого записывается лог передвижений игрока.
     * @returns {[number, number][]} маршрут к выходу представленный списоком пар координат
     */
    function solution(maze, x, y, log) {
        var pathLog = []; //полный лог передвижений игрока, {x: number, y: number, direction: number}[]
        var currentPath = []; //текущий пройденный путь с учетом движения назад, {x: number, y: number, direction: number}[]
        var currentPosition = {}; // текущие координаты игрока, {x: number, y: number}
        var prevChoisePoint = {}; // координаты последней пройденной точки на которой было более одного варианта направления следующего шага (развилки), {x: number, y: number}
        var prevStepDirection = 0; // направление последнего шага игрока, number

        // возвращает результирующий путь в формате [number, number][]
        function makePath() {
            return currentPath.map(function(pathRecord){
                return [pathRecord.x, pathRecord.y];
            });
        }

        // возвращает true если точка point находится за краем лабиринта
        function isEdge(point) {
            return point.x < 0 || point.x > maze[0].length - 1 || point.y < 0 || point.y > maze.length - 1;
        }

        // возвращает true если игрок уже находился в точке point
        function isPassed(point) {
            var result = false;
            var i = 0;
            while (!result && i <= pathLog.length - 1) {
                result = result || (pathLog[i].x == point.x && pathLog[i].y == point.y);
                i++;
            }
            return result;
        }

        // возвращает true если в точке point расположена стена
        function isWall(point) {
            return maze[point.y][point.x] == WALL;
        }

        // получает координаты игрока после шага в направлении direction
        function getNewPosition(direction) {
            var newPosition = {
                x: currentPosition.x + (direction == DIRECTION.right) - (direction == DIRECTION.left), // Number(true) -> 1; Number(false) -> 0;
                y: currentPosition.y + (direction == DIRECTION.bottom) - (direction == DIRECTION.top)
            }
            return newPosition;
        }

        // определяет можно ли двигаться в направлении direction
        function canMove(direction) { 
            var newPosition = getNewPosition(direction);
            return !isEdge(newPosition) && !isWall(newPosition) && !isPassed(newPosition);
        }

        // делает шаг в направлении direction
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

        // делает шаг назад 
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
                prevStepDirection = currentPath[currentPath.length - 1].direction; // сохраняем направление шага предествующего данной позиции, т.е. шага который в первый раз привел игрока в эту точку в первый раз.
            }
        }

        // определяет направление следующего шага
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

        // условие выхода из лабиринта, возвращает true если выход найден
        function foundExit() {
            return currentPosition.y == maze.length - 1;
        }

        try {
            currentPosition = {x: x, y: y}; // ставим игрока в точку x, y
            if (isEdge(currentPosition)) {  // проверяем на некорректные параметы
                throw ({message: "Некорректные параметры: стартовая точка за краем лабиринта."});
            }
            if (isWall(currentPosition)) {
                throw ({message: "Некорректные параметры: стартовая точка находится на стене."});
            }
            prevStepDirection = DIRECTION.bottom; // инициальзируем направление последнего шага.
            while (!foundExit()) { //цикл завершается если выход найден или через исключение
                var direction = getNextStepDirection(); // получаем направление след шага
                if (direction == DIRECTION.back) {
                    stepBack(); // шаг назад
                } else {
                    makeStep(direction); // шаг в направлении direction
                }
            }
            var logRecord = { // добавляем последние координаты игрока в лог и в итоговый путь.
                x: currentPosition.x,
                y: currentPosition.y,
                direction: prevStepDirection
            }
            currentPath.push(logRecord);
            pathLog.push(logRecord);
            log.pathLog = pathLog; // возвращаем лог передвижений и результирующий путь
            return makePath();
        } catch (e) {
            console.log(e);
            alert(e.message);
            log.pathLog = pathLog; // возвращаем лог передвижений и результирующий путь (ну или хотя бы часть) 
            return makePath();
        }
    }

    root.maze.solution = solution;
})(this);
