import { z } from "zod";
import { DateLike, ImageUrlSchema, NameSchema } from "./common";
import { RoleRewardSchema } from "./roleReward";
import { RuleSchema } from "./rule";

export const CreateRoleSchema = z.object({
  name: NameSchema.min(1, "You must specify a name for the role"),
  description: z.string().nullish(),
  imageUrl: ImageUrlSchema.nullish(),
  groupId: z.string().uuid(),
});

export type CreateRoleForm = z.infer<typeof CreateRoleSchema>;

const RoleSchema = CreateRoleSchema.extend({
  id: z.string().uuid(),
  createdAt: DateLike,
  updatedAt: DateLike,
  memberCount: z.number().nonnegative(),
  topLevelAccessGroupId: z.string().uuid(),
  accessGroups: z.array(
    z.object({
      gate: z.enum(["AND", "OR", "ANY_OF"]),
      rules: z.array(RuleSchema),
    }),
  ),
  rewards: z.array(RoleRewardSchema),
});

export type Role = z.infer<typeof RoleSchema>;
