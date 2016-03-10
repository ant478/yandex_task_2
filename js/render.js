(function (root) {
    var EMPTY = root.maze.EMPTY;
    var WALL = root.maze.WALL;
    var PATH = root.maze.PATH;
    var CURRENT = root.maze.CURRENT;
    var DIRECTION = root.maze.DIRECTION;

    /**
     * Создает HTML элемент заданного типа с заданным CSS классом
     *
     * @param {string} type тип создаваемого HTML элемента
     * @param {string} className CSS класс
     * @returns {HTMLElement} HTML элемент
     */
    function element(type, className, id) { // добавил возможность указания id создаваемого элемента
        var elem = document.createElement(type);
        elem.className = className;
        if (id) {
            elem.id = id; 
        }        
        return elem;
    }

    /**
     * Создает визуализацию лабиринта по его схеме с возможностью наложения маршрута
     *
     * @param {number[][]} maze схема лабиринта
     * @param {[number, number][]} [path] маршрут
     * @returns {HTMLElement} HTML элемент
     */
    function render(maze, path) {
        if (path && path.length) {
            var point, 
                i;

            for (i = 0; i < path.length; i++) {
                point = path[i];
                maze[point[1]][point[0]] = PATH;
            }
            point = path[path.length - 1];
            maze[point[1]][point[0]] = CURRENT;
        }

        var containerElem = element('div', 'maze'),
            rowElem,
            type,
            row, 
            cell,
            x, 
            y;

        for (y = 0; y < maze.length; y++) {
            row = maze[y];
            rowElem = element('div', 'maze__row');

            for (x = 0; x < row.length; x++) {
                cell = row[x];

                switch (cell) {
                    case WALL:
                        type = 'wall';
                        break;

                    case PATH:
                        type = 'path';
                        break;

                    case CURRENT:
                        type = 'current';
                        break;

                    default:
                        type = undefined;
                }

                rowElem.appendChild(
                    element('div', 'maze__cell' + (type ? ' maze__cell_' + type : ''), 'x' + x + 'y' + y) // добавил id к каждой ячейке
                );
            }

            containerElem.appendChild(rowElem);
        }

        return containerElem;
    }

    function renderPathBySteps (maze, path, pathLog, interval) {
        var renderedCount = 0; //колличество отрисованных шагов
        var currentPosition = {}; // текущая позиция
        var currentCell = null; // текущая ячейка

        function hasClass(el, className) { // 3 функции для работы с классами позаимствовал, дабы не изобретать велосипед.
          if (el.classList)
            return el.classList.contains(className)
          else
            return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
        }

        function addClass(el, className) {
          if (el.classList)
            el.classList.add(className)
          else if (!hasClass(el, className)) el.className += " " + className
        }

        function removeClass(el, className) {
          if (el.classList)
            el.classList.remove(className)
          else if (hasClass(el, className)) {
            var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
            el.className=el.className.replace(reg, ' ')
          }
        }

        function renderResultPath() { // устанавливаем элементам результирующего пути соответствующий класс
            var element;
            for (var i = 0; i <= path.length - 1; i++) {
                element = maze.querySelector('#x' + path[i][0] + 'y' + path[i][1]);
                if (element) {
                    addClass(element, "maze__cell_path_result");
                } else {
                    console.log("Cell (" + path[i][0] + "," + path[i][1] + ")" + "is missing.");
                }                
            }
        }

        function addDirectionClass(element, direction) { // получаем направление шага в виде строки
            switch (pathLog[renderedCount].direction) {
                case DIRECTION.bottom:
                    addClass(element, "bottom");
                    removeClass(element, "top");
                    break;
                case DIRECTION.top: 
                    addClass(element, "top");
                    removeClass(element, "bottom");
                    break;
                case DIRECTION.left: 
                    addClass(element, "left");
                    removeClass(element, "right");
                    break;
                case DIRECTION.right: 
                    addClass(element, "right");
                    removeClass(element, "left");
                    break;
                default:
                    addClass(element, "none");
            }
        }

        function renderNextStep() { // добавляет или удаляет к ячейкам классы 'maze__cell_current', 'maze__cell_pathLog', 'bottom' 'top' 'left' 'right'.
            removeClass(currentCell, "maze__cell_current");
            currentPosition = {x: pathLog[renderedCount].x, y: pathLog[renderedCount].y}; //получаем текущую позицию игрока
            currentCell = maze.querySelector('#x' + currentPosition.x + 'y' + currentPosition.y); //получаем текущую ячейку лабиринта
            if (currentCell) {
                addDirectionClass(currentCell, pathLog[renderedCount].direction); // добавляем класс направления для последующего отображения стрелки
                addClass(currentCell, "maze__cell_current"); // устанавливаем классы обозначающие текущую позицию и элемент пути
                addClass(currentCell, "maze__cell_path");
            } else {
                console.log("Cell (" + currentPosition.x + "," + currentPosition.y + ")" + "is missing.");
            }
            renderedCount++;
            if (renderedCount > pathLog.length - 1) { // отменяем интервал когда отрисованы все шаги
                if (currentCell)
                    addClass(currentCell, "maze__cell_finish"); //устанавливаем класс обозначающий выход из лабиринта
                clearInterval(interval);
                renderResultPath();
            }
        }

        currentPosition = {x: pathLog[0].x, y: pathLog[0].y}; //получаем текущую позицию игрока
        currentCell = maze.querySelector('#x' + currentPosition.x + 'y' + currentPosition.y);  //получаем текущую ячейку лабиринта
        if (currentCell) {
            addClass(currentCell, "maze__cell_current");  // устанавливаем классы обозначающие текущую позиция, элемент пути и начало движения
            addClass(currentCell, "maze__cell_path");
            addClass(currentCell, "maze__cell_start");
        } else {
            console.log("Cell (" + currentPosition.x + "," + currentPosition.y + ")" + "is missing.");
        }
        var interval = setInterval(renderNextStep, interval); // последовательно рисуем все шаги через промежуток времени interval
    }

    root.maze.renderPathBySteps = renderPathBySteps;
    root.maze.render = render;
})(this);
