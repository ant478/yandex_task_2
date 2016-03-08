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
        var currentPosition = [];

        /* координаты последней пройденной точки на которой было более одного варианта направления следующего шага */
        var prevChoisePoint = [];

        /* направление последнего шага игрока */
        var prevStepDirection = 0;

        /* возвразает путь в формате {[number. number][]} */
        function makePath() {

        }

        /* делает шаг в направлении direction */
        function makeStep(direction) {

        }

        /* делает шаг назад */
        function stepBack() {

        }

        /* определяет направление следующего шага */
        function getNextStepDirection() {

        }

        /* возвращает true если есть более одного варианта след шага */
        function haveChoise() {

        }

        /* условие выхода из лабиринта, возвращает true если выход найден */
        function foundExit() {

        }

        try {
            currentPosition = [x, y];
            while (!foundExit()) { //цикл завершается если выход найден или через исключение
                if (haveChoise()) {
                    prevChoisePoint = currentPosition; // сохраняем последнюю точку в которой был выбор
                }
                var direction = getNextStepDirection(); // получаем направление след шага
                if (direction == DIRECTION.back) {
                    stepBack(); // шаг назад
                } else {
                    makeStep(direction); // шаг в направлении direction
                }
            }
            return makePath();
        } catch (e) {
            console.log(e);
            alert(e.message);
            return [];
        }
    }

    root.maze.solution = solution;
})(this);
