(function (root) {
    var map = root.maze.MAZE_Y;
    var log = {pathLog: []}; // полный лог движение игрока 
    var path = root.maze.solution(map, 1, 0, log); // итоговый путь из лабиринта с учетом движения назад
    var pathStub = [];
    var interval = 10;

    document.querySelector('.outer').appendChild(
        root.maze.render(map, pathStub) // рисуем только лабиринт
    );
    var mazeElement = document.getElementsByClassName('maze')[0];
    root.maze.renderPathBySteps(mazeElement, path, log.pathLog, interval);  // отображаем движение игрока по шагам    
})(this);
