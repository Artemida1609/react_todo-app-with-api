import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { Todo } from '../types/Todo';
import { FilterType } from '../enums/FilterType';
import { deleteTodo } from '../api/todos';

type Props = {
  todos: Todo[];
  setTodos: (arg: Todo[]) => void;
  setErrorMessage: (arg: string) => void;
  setLoadingTodoId: (arg: number[]) => void;
  setFilteredTodos: (arg: Todo[]) => void;
};

export const Footer: React.FC<Props> = ({
  todos,
  setTodos,
  setErrorMessage,
  setLoadingTodoId,
  setFilteredTodos,
}) => {
  const [completedTodos, setCompletedTodos] = useState<Todo[]>(todos);
  const [activeTodos, setActiveTodos] = useState<Todo[]>(todos);
  const [selectedLink, setSelectedLink] = useState(FilterType.All);

  const filterTodos = (selectedLinkProp: FilterType) => {
    switch (selectedLinkProp) {
      case FilterType.Active:
        setSelectedLink(FilterType.Active);
        setFilteredTodos(todos.filter(todo => !todo.completed));
        break;
      case FilterType.Completed:
        setSelectedLink(FilterType.Completed);
        setFilteredTodos(todos.filter(todo => todo.completed));
        break;
      default:
        setSelectedLink(FilterType.All);
        setFilteredTodos(todos);
        break;
    }
  };

  const handleClearCompleted = () => {
    const allCompletedTodos = todos.filter(todo => todo.completed);
    const todoIds = allCompletedTodos.map(todoElem => todoElem.id);

    setLoadingTodoId(todoIds);

    Promise.allSettled(allCompletedTodos.map(todo => deleteTodo(todo.id))).then(
      results => {
        const failedIds = results
          .map((result, index) =>
            result.status === 'rejected' ? allCompletedTodos[index].id : null,
          )
          .filter((id): id is number => id !== null);
        const successfullyDeletedIds = allCompletedTodos
          .map(todo => todo.id)
          .filter(id => !failedIds.includes(id));

        const updatedTodos = todos.filter(
          todo => !successfullyDeletedIds.includes(todo.id),
        );

        setTodos(updatedTodos);
        setFilteredTodos(updatedTodos);
        setLoadingTodoId([]);
        if (failedIds.length > 0) {
          setErrorMessage('Unable to delete a todo');
        }
      },
    );
  };

  useEffect(() => {
    const completed = todos.filter(todoEl => todoEl.completed);
    const active = todos.filter(todoElem => !todoElem.completed);

    setCompletedTodos(completed);
    setActiveTodos(active);
    filterTodos(selectedLink);
  }, [todos]);

  return (
    <footer className="todoapp__footer" data-cy="Footer">
      <span className="todo-count" data-cy="TodosCounter">
        {`${activeTodos.length} items left`}
      </span>

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
              onClick={() => filterTodos(type)}
            >
              {type}
            </a>
          );
        })}
      </nav>

      <button
        type="button"
        className="todoapp__clear-completed"
        disabled={completedTodos.length === 0}
        data-cy="ClearCompletedButton"
        onClick={handleClearCompleted}
      >
        Clear completed
      </button>
    </footer>
  );
};
