import React from 'react';
import { TodoItem } from './TodoItem';
import { Todo } from '../types/Todo';

type Props = {
  todos: Todo[];
  setTodos: (arg: Todo[]) => void;
  setErrorMessage: (arg: string) => void;
  loadingTodoId: number[];
  setLoadingTodoId: (arg: number[]) => void;
  // filteredTodos: Todo[];
  // setFilteredTodos: (arg: Todo[]) => void;
};

export const TodoList: React.FC<Props> = ({
  todos,
  setTodos,
  setErrorMessage,
  loadingTodoId,
  setLoadingTodoId,
  // filteredTodos,
  // setFilteredTodos,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          todos={todos}
          setTodos={setTodos}
          setErrorMessage={setErrorMessage}
          loadingTodoId={loadingTodoId}
          setLoadingTodoId={setLoadingTodoId}
          // setFilteredTodos={setFilteredTodos}
        />
      ))}
    </section>
  );
};
