/* eslint-disable max-len */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import { addTodo, getTodos, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import classNames from 'classnames';
import { Header } from './components/Header';
import { TodoList } from './components/TodoList';
import { Footer } from './components/Footer';
import { FilterType } from './enums/FilterType';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingTodoId, setLoadingTodoId] = useState<number[]>([]);
  const inputFocus = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [selectedLink, setSelectedLink] = useState<FilterType>(FilterType.All);
  // const [activeTodos, setActiveTodos] = useState<number>(0);
  // const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);

  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch(() => {
        setErrorMessage('Unable to load todos');
      });
  }, []);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 3000);

      return () => clearTimeout(timer);
    }

    return;
  }, [errorMessage]);

  const filterTodos = (selectedLinkProp: FilterType) => {
    switch (selectedLinkProp) {
      case FilterType.Active:
        // setSelectedLink(FilterType.Active);
        return todos.filter(todo => !todo.completed);
      case FilterType.Completed:
        // setSelectedLink(FilterType.Completed);
        return todos.filter(todo => todo.completed);
      default:
        // setSelectedLink(FilterType.All);
        return todos;
    }
  };

  const filteredTodos = filterTodos(selectedLink);

  let activeTodos = todos.filter(todo => !todo.completed).length;
  // const activeFiltered = filterTodos(FilterType.Active);
  // const completedFiltered = filterTodos(FilterType.Completed);

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          setErrorMessage={setErrorMessage}
          setTodos={setTodos}
          todos={todos}
          setLoadingTodoId={setLoadingTodoId}
          inputFocus={inputFocus}
          inputValue={inputValue}
          setInputValue={setInputValue}
          activeTodos={activeTodos}
          // setActiveTodos={setActiveTodos}
          // setFilteredTodos={setFilteredTodos}
        />

        <TodoList
          todos={todos}
          setTodos={setTodos}
          setErrorMessage={setErrorMessage}
          loadingTodoId={loadingTodoId}
          setLoadingTodoId={setLoadingTodoId}
          filteredTodos={filteredTodos}
          activeTodos={activeTodos}
          // filteredTodos={filteredTodos}
          // setFilteredTodos={setFilteredTodos}
        />

        {todos?.length > 0 && (
          <Footer
            setLoadingTodoId={setLoadingTodoId}
            todos={todos}
            setTodos={setTodos}
            setErrorMessage={setErrorMessage}
            selectedLink={selectedLink}
            setSelectedLink={setSelectedLink}
            activeTodos={activeTodos}
            // setActiveTodos={setActiveTodos}
            // setFilteredTodos={setFilteredTodos}
          />
        )}
      </div>

      <div
        data-cy="ErrorNotification"
        className={classNames(
          'notification is-danger is-light has-text-weight-normal',
          {
            hidden: errorMessage.length === 0,
          },
        )}
      >
        <button data-cy="HideErrorButton" type="button" className="delete" />
        {errorMessage.length > 0 && errorMessage}
      </div>
    </div>
  );
};
