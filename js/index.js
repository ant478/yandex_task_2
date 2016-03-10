(function (root) {
    var map = root.maze.MAZE_51;
    var log = {pathLog: []}; // полный лог движение игрока 
    var path = root.maze.solution(map, 1, 0, log); // итоговый путь из лабиринта с учетом движения назад
    var interval = 30;

    document.querySelector('.outer').appendChild(
        root.maze.render(map, []) // рисуем только лабиринт
    );
    var mazeElement = document.getElementsByClassName('maze')[0];
    root.maze.renderPathBySteps(mazeElement, path, log.pathLog, interval);  // отображаем движение игрока по шагам    
})(this);
