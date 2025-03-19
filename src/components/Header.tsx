import React, { FormEventHandler, useEffect, useState } from 'react';
import { addTodo, updateTodo, USER_ID } from '../api/todos';
import { Todo } from '../types/Todo';
import classNames from 'classnames';

type Props = {
  setErrorMessage: (arg: string) => void;
  setTodos: (arg: Todo[]) => void;
  setAllTodos: (arg: Todo[]) => void;
  allTodos: Todo[];
  setTodosCounter: (arg: number) => void;
  setLoadingTodoId: (arg: number[]) => void;
  inputFocus: React.RefObject<HTMLInputElement>;
  inputValue: string;
  setInputValue: (arg: string) => void;
};

export const Header: React.FC<Props> = ({
  setErrorMessage,
  setTodos,
  setAllTodos,
  allTodos,
  setTodosCounter,
  setLoadingTodoId,
  inputFocus,
  inputValue,
  setInputValue,
}) => {
  const [disabled, setDisabled] = useState(false);
  const [enableCounter, setEnableCounter] = useState(true);

  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    if (inputValue.trim().length === 0) {
      setErrorMessage('Title should not be empty');

      return;
    } else {
      const newTodo: Omit<Todo, 'id' | 'completed'> = {
        userId: USER_ID,
        title: inputValue.trim(),
      };
      const tempTodo: Todo = {
        id: Date.now(),
        userId: USER_ID,
        title: inputValue.trim(),
        completed: false,
      };

      setDisabled(true);
      setLoadingTodoId([tempTodo.id]);
      setEnableCounter(false);
      setAllTodos([...allTodos, tempTodo]);

      addTodo(newTodo)
        .then(newTodoFromServer => {
          const todos = allTodos.slice(0, allTodos.length);

          setAllTodos([...todos, newTodoFromServer]);
          setEnableCounter(true);
          setLoadingTodoId([]);
          setDisabled(false);
          setInputValue('');
        })
        .catch(() => {
          setErrorMessage('Unable to add a todo');
          setAllTodos(allTodos.slice(0, allTodos.length));
          setDisabled(false);
        });
    }
  };

  const handleToggleAll = () => {
    let todosToToggle = [];
    const activeTodos = allTodos.filter(todoElem => !todoElem.completed);

    if (activeTodos.length > 0) {
      todosToToggle = [...activeTodos];
    } else {
      todosToToggle = allTodos.filter(todoEl => todoEl.completed);
    }

    const todosId = todosToToggle.map(todoElem => todoElem.id);

    setLoadingTodoId(todosId);

    Promise.allSettled(
      todosToToggle.map(todo => {
        const updatedTodo = { ...todo, completed: !todo.completed };

        return updateTodo(updatedTodo);
      }),
    )
      .then(results => {
        const updatedTodos = allTodos.map(todo => {
          const updatedTodoResult = results.find(
            res => res.status === 'fulfilled' && res.value?.id === todo.id,
          );

          return updatedTodoResult
            ? { ...todo, completed: !todo.completed }
            : todo;
        });

        setTodos(updatedTodos);
        setAllTodos(updatedTodos);
        setLoadingTodoId([]);
      })
      .catch(() => setErrorMessage('Unable to update a todo'));
  };

  useEffect(() => {
    if (inputFocus.current) {
      inputFocus.current.focus();
    }
  }, [allTodos.length, inputValue, inputFocus]);

  useEffect(() => {
    if (enableCounter) {
      setTodosCounter(allTodos.filter(todo => !todo.completed).length);
    }
  }, [allTodos, enableCounter, setTodosCounter]);

  const allTodosActive =
    allTodos.length === allTodos.filter(todoItem => todoItem.completed).length;

  return (
    <header className="todoapp__header">
      {allTodos.length > 0 && (
        <button
          type="button"
          className={classNames('todoapp__toggle-all', {
            active: allTodosActive,
          })}
          data-cy="ToggleAllButton"
          onClick={handleToggleAll}
        />
      )}

      <form onSubmit={handleSubmit}>
        <input
          ref={inputFocus}
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          disabled={disabled}
        />
      </form>
    </header>
  );
};
