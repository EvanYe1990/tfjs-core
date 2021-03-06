/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import {doc} from '../doc';
import {ENV} from '../environment';
import {Tensor} from '../tensor';
import * as types from '../types';
import * as util from '../util';
import * as broadcast_util from './broadcast_util';
import {operation} from './operation';

export class LogicalOps {
  /**
   * Returns the truth value of `NOT x` element-wise.
   *
   * @param x The input tensor. Must be of dtype 'bool'.
   */
  @doc({heading: 'Operations', subheading: 'Logical'})
  @operation
  static logicalNot<T extends Tensor>(x: T): T {
    util.assert(x.dtype === 'bool', 'Error Array must be of type bool.');
    return ENV.engine.runKernel(backend => backend.logicalNot(x), {x});
  }

  /**
   * Returns the truth value of a AND b element-wise. Supports broadcasting.
   *
   * @param a The first input tensor. Must be of dtype bool.
   * @param b The second input tensor. Must be of dtype bool.
   */
  @doc({heading: 'Operations', subheading: 'Logical'})
  @operation
  static logicalAnd<T extends Tensor>(a: Tensor, b: Tensor): T {
    util.assert(
        a.dtype === 'bool' && b.dtype === 'bool',
        'Error Array must be of type bool.');
    broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
    return ENV.engine.runKernel(backend => backend.logicalAnd(a, b), {a, b}) as
        T;
  }

  /**
   * Returns the truth value of `a OR b` element-wise. Supports broadcasting.
   *
   * @param a The first input tensor. Must be of dtype bool.
   * @param b The second input tensor. Must be of dtype bool.
   */
  @doc({heading: 'Operations', subheading: 'Logical'})
  @operation
  static logicalOr<T extends Tensor>(a: Tensor, b: Tensor): T {
    util.assert(
        a.dtype === 'bool' && b.dtype === 'bool',
        'Error Array must be of type bool.');
    broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
    return ENV.engine.runKernel(backend => backend.logicalOr(a, b), {a, b}) as
        T;
  }

  /**
   * Returns the truth value of `a XOR b` element-wise. Supports broadcasting.
   *
   * @param a The first input tensor. Must be of dtype bool.
   * @param b The second input tensor. Must be of dtype bool.
   */
  @doc({heading: 'Operations', subheading: 'Logical'})
  @operation
  static logicalXor<T extends Tensor>(a: Tensor, b: Tensor): T {
    util.assert(
        a.dtype === 'bool' && b.dtype === 'bool',
        'Error Array must be of type bool.');
    broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
    // x ^ y = (x | y) & ~(x & y)
    return LogicalOps.logicalOr(a, b).logicalAnd(
               LogicalOps.logicalAnd(a, b).logicalNot()) as T;
  }

  /**
   * Returns the elements, either `a` or `b` depending on the `condition`.
   *
   * If the condition is true, select from `a`, otherwise select from `b`.
   *
   * @param condition The input condition. Must be of dtype bool.
   * @param a If `condition` is rank 1, `a` may have a higher rank but
   *     its first dimension must match the size of `condition`.
   * @param b A tensor with the same shape and type as `a`.
   */
  @doc({heading: 'Operations', subheading: 'Logical'})
  @operation
  static where<T extends Tensor>(condition: Tensor, a: T, b: T): T {
    util.assert(
        condition.dtype === 'bool' || a.dtype === 'bool' || b.dtype === 'bool',
        'Error Array must be of type bool.');

    util.assertShapesMatch(a.shape, b.shape, 'Error in where: ');

    if (condition.rank === 1) {
      // If condition rank is 1, then the first dimension must match the size of
      // condition.
      util.assert(
          condition.shape[0] === a.shape[0],
          'The first dimension of `a` must match the size of `condition`.');
    } else {
      // A must have the same shape as condition.
      util.assertShapesMatch(condition.shape, b.shape, 'Error in where: ');
    }

    // Default to highest percision of number:
    const dtype = types.upcastType(a.dtype, b.dtype);
    return ENV.engine.runKernel(
               backend => backend.where(condition, a, b, dtype),
               {condition, a, b}) as T;
  }
}
