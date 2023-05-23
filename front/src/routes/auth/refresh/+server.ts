import winstonLogger from '$src/lib/server/winston.logger';
import type { AuthServiceClient } from '$src/lib/stubs/auth/v1alpha/service.client';
import { FindRequest, User } from '$src/lib/stubs/user/v1alpha/message';
import type { UserServiceClient } from '$src/lib/stubs/user/v1alpha/service.client';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, cookies }) => {
	const rt = cookies.get('refreshToken');
	if (!rt) return new Response(null);

	try {
		const { response } = await (locals.authClient as AuthServiceClient).refreshToken({
			ip: '10.10.10.10',
			refreshToken: rt
		});

		cookies.set('jwt', response.jwt, {
			path: '/',
			httpOnly: true
		});

		const { response: userResponse } = await (locals.userClient as UserServiceClient).find(
			FindRequest.create({
				id: response.userId
			}),
			{
				meta: {
					Authorization: `Bearer ${response.jwt}`
				}
			}
		);

		const user = userResponse.user?.[0];
		const JSONUser = User.toJsonString(user);

		cookies.set('user', Buffer.from(JSONUser, 'utf-8').toString('base64'), {
			path: '/',
			httpOnly: true
		});

		return new Response(JSONUser);
	} catch (error) {
		winstonLogger.debug(error);
		return new Response(JSON.stringify(error), { status: 401 });
	}
};

export const DELETE: RequestHandler = async ({ cookies }) => {
	cookies.get('jwt') &&
		cookies.delete('jwt', {
			path: '/',
			httpOnly: true
		});
	cookies.get('refreshToken') &&
		cookies.delete('refreshToken', {
			path: '/',
			httpOnly: true
		});
	cookies.get('user') &&
		cookies.delete('user', {
			path: '/',
			httpOnly: true
		});

	return new Response();
};
