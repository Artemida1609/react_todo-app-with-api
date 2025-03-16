import classNames from 'classnames';
import React from 'react';
import { Todo } from '../types/Todo';
import { FilterType } from '../enums/FilterType';
import { deleteTodo } from '../api/todos';

type Props = {
  todosCounter: number;
  selectedLink: FilterType;
  setSelectedLink: (arg: FilterType) => void;
  todos: Todo[];
  setTodos: (arg: Todo[]) => void;
  allTodos: Todo[];
  setAllTodos: (arg: Todo[]) => void;
  setErrorMessage: (arg: string) => void;
};

export const Footer: React.FC<Props> = ({
  todosCounter,
  selectedLink,
  setSelectedLink,
  todos,
  setTodos,
  allTodos,
  setAllTodos,
  setErrorMessage,
}) => {
  //#region handle functions
  const handleClearCompleted = () => {
    const allCompletedTodos = todos.filter(todo => todo.completed);

    Promise.allSettled(allCompletedTodos.map(todo => deleteTodo(todo.id))).then(
      results => {
        // Отримуємо ID тудушок, які НЕ вдалося видалити
        const failedIds = results
          .map((result, index) =>
            result.status === 'rejected' ? allCompletedTodos[index].id : null,
          )
          .filter((id): id is number => id !== null);
        // Отримуємо тільки ті тудушки які НЕ видалились успішно
        const successfullyDeletedIds = allCompletedTodos
          .map(todo => todo.id)
          .filter(id => !failedIds.includes(id));

        const updatedTodos = todos.filter(
          todo => !successfullyDeletedIds.includes(todo.id),
        );

        // Встановлюємо тудушки
        setTodos(updatedTodos);
        setAllTodos(updatedTodos);
        // Якщо є тудушки зі статусом 'rejected' виводимо помилку
        if (failedIds.length > 0) {
          setErrorMessage('Unable to delete a todo');
        }
      },
    );
  };
  //#endregion

  return (
    <footer className="todoapp__footer" data-cy="Footer">
      <span className="todo-count" data-cy="TodosCounter">
        {`${todosCounter} items left`}
      </span>

      {/* Active link should have the 'selected' class */}

      <nav className="filter" data-cy="Filter">
        {Object.values(FilterType).map(type => {
          return (
            <a
              href="#/"
              key={type}
              className={classNames('filter__link', {
                selected: selectedLink === type,
              })}
              data-cy={type === 'All' ? 'FilterLinkAll' : `FilterLink${type}`}
              onClick={() => {
                setSelectedLink(type);
              }}
            >
              {type}
            </a>
          );
        })}
      </nav>

      {/* this button should be disabled if there are no completed todos */}
      <button
        type="button"
        className="todoapp__clear-completed"
        disabled={!allTodos.some(todo => todo.completed)}
        data-cy="ClearCompletedButton"
        onClick={handleClearCompleted}
      >
        Clear completed
      </button>
    </footer>
  );
};
