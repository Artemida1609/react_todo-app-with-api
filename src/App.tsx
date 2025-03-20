/* eslint-disable max-len */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import { getTodos, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import classNames from 'classnames';
import { Header } from './components/Header';
import { TodoList } from './components/TodoList';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingTodoId, setLoadingTodoId] = useState<number[]>([]);
  const inputFocus = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);

  useEffect(() => {
    getTodos()
      .then(todosFromServer => {
        if (todosFromServer) {
          setTodos(todosFromServer);
          setFilteredTodos(todosFromServer);
        }
      })
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
          setFilteredTodos={setFilteredTodos}
        />

        <TodoList
          todos={todos}
          setTodos={setTodos}
          setErrorMessage={setErrorMessage}
          loadingTodoId={loadingTodoId}
          setLoadingTodoId={setLoadingTodoId}
          filteredTodos={filteredTodos}
          setFilteredTodos={setFilteredTodos}
        />

        {todos.length > 0 && (
          <Footer
            setLoadingTodoId={setLoadingTodoId}
            todos={todos}
            setTodos={setTodos}
            setErrorMessage={setErrorMessage}
            setFilteredTodos={setFilteredTodos}
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
