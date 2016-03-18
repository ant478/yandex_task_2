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
     * @param {string} id ID элемента
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

    /**
     * Визуализирует движение игрока в уже отрисованном лабиринте. 
     * Отрисовка выполняется с помощья назначения элементам лабиринта различных классов: "maze__cell_start" - начало пути, 
     * "maze__cell_current" - текущая позиция игрока, "maze__cell_path" - пройденная точка, "maze__cell_finish" - конечная 
     * точка пути, "maze__cell_path_result" - результирующий путь. 
     * Вначале первый элемент пути помечается как начало пути, как пройденная точка и как текущая позиция игрока. 
     * В каждой следующей итерации функция renderNextStep берет следующий элемент массива pathLog.
     * Элемент лабиринта, соответствующий точке пути, помечается как текущая позиция, как пройденная точка, а также ей присваивается 
     * класс направления (функция addDirectionClass), в зависимости от направления движения игрока в этой точке, для последующей 
     * отрисовки результирующего пути. 
     * Когда все шаги игрока отрисованы, перебираются элементы массива path, содержащего результирующий путь игрока. Элементам, 
     * соответствующим этим точкам, функцией renderResultPath приваивается класс "maze__cell_path_result".
     *
     * @param {HTMLElement} maze лабиринт созданный функцией render
     * @param {[number, number][]} path итоговый маршрут игрока
     * @param {{x: number, y: number, direction: number}[]} pathLog полный лог передвижения игрока
     * @param {number} interval интервал отрисовки шага в миллисекундах
     */
    function renderPathBySteps (maze, path, pathLog, interval) {
        var renderedCount = 0; //колличество отрисованных шагов, number
        var currentPosition = {}; // текущая позиция, {x: number, y: number}
        var currentCell = null; // текущая ячейка, HTMLElement

        // возвразает true если элемент el имеет класс className, false - если не имеет.
        function hasClass(el, className) {
          if (el.classList)
            return el.classList.contains(className)
          else
            return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
        }

        // добавляет элементу el, класс className
        function addClass(el, className) {
          if (el.classList)
            el.classList.add(className)
          else if (!hasClass(el, className)) el.className += " " + className
        }

        // удаляет у элемента el, класс className
        function removeClass(el, className) {
          if (el.classList)
            el.classList.remove(className)
          else if (hasClass(el, className)) {
            var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
            el.className=el.className.replace(reg, ' ')
          }
        }

        // добавляет элементам результирующего пути класс "maze__cell_path_result"
        function renderResultPath() {
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

        // добавляет элементу element классы "top", "bottom", "left", "right" в зависимости от значения direction
        function addDirectionClass(element, direction) {
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

        // перебирает элементы массива pathLog и назначает соответсвующим ячейкам классы "maze__cell_finish", "maze__cell_current", "maze__cell_path"
        function renderNextStep() { 
            removeClass(currentCell, "maze__cell_current"); //удаляем класс со старой текущей позиции
            currentPosition = {x: pathLog[renderedCount].x, y: pathLog[renderedCount].y}; //получаем текущую позицию игрока
            currentCell = maze.querySelector('#x' + currentPosition.x + 'y' + currentPosition.y); //получаем ячейку лабиринта, соответствующую текущей позиции
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
                renderResultPath(); // рисуем результирующий путь
            }
        }

        currentPosition = {x: pathLog[0].x, y: pathLog[0].y}; //получаем текущую позицию игрока
        currentCell = maze.querySelector('#x' + currentPosition.x + 'y' + currentPosition.y);  //получаем ячейку лабиринта, соответствующую текущей позиции
        if (currentCell) {
            addClass(currentCell, "maze__cell_current");  // устанавливаем классы обозначающие текущую позицию, элемент пути и начальную точку
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
