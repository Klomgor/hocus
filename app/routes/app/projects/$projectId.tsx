import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Button, Tabs } from "flowbite-react";
import { StatusCodes } from "http-status-codes";
import moment from "moment";
import path from "path-browserify";
import { AppPage } from "~/components/app-page";
import { HttpError } from "~/http-error.server";
import { PagePaths } from "~/page-paths.shared";
import { UuidValidator } from "~/schema/uuid.validator.server";

export const loader = async ({ context: { db, req } }: LoaderArgs) => {
  const { success, value: projectExternalId } = UuidValidator.SafeParse(
    path.parse(req.params[0]).name,
  );
  if (!success) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Project id must be a UUID");
  }
  const project = await db.project.findUnique({
    where: { externalId: projectExternalId },
    include: { gitRepository: true },
  });
  if (project == null) {
    throw new HttpError(StatusCodes.NOT_FOUND, "Project not found");
  }

  return json({
    project: {
      name: project.name,
      externalId: project.externalId,
      createdAt: project.createdAt.getTime(),
    },
    gitRepository: {
      url: project.gitRepository.url,
    },
  });
};

export default function ProjectRoute(): JSX.Element {
  const { project, gitRepository } = useLoaderData<typeof loader>();
  const createdAt = moment(project.createdAt).fromNow();

  return (
    <AppPage>
      <div className="mt-8 mb-4">
        <a
          href={PagePaths.ProjectList}
          className="text-sm text-gray-400 hover:text-gray-300 transition-all"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>
          <span>Back to Project List</span>
        </a>
      </div>
      <div className="mb-8 flex justify-between items-end">
        <h1 className="text-4xl font-bold">{project.name}</h1>
        <Button href={"#"} color="success" className="transition-all">
          <i className="fa-solid fa-file-circle-plus mr-2"></i>
          <span>New Workspace</span>
        </Button>
      </div>
      <div className="text-md">
        <p className="mb-2">
          <span className="text-gray-400">Repository URL:</span>{" "}
          <span className="font-bold">{gitRepository.url}</span>
        </p>
        <p>
          <span className="text-gray-400">Created: </span>
          <span className="font-bold">{createdAt}</span>
        </p>
      </div>
      <Tabs.Group aria-label="Tabs with icons" className="mt-4">
        <Tabs.Item
          active={true}
          title={
            <>
              <i className="fa-solid fa-file-circle-plus mr-2"></i>
              <span className="font-bold">Workspaces</span>
            </>
          }
        >
          Profile content
        </Tabs.Item>
        <Tabs.Item title="Dashboard">Dashboard content</Tabs.Item>
        <Tabs.Item title="Settings">Settings content</Tabs.Item>
        <Tabs.Item title="Contacts">Contacts content</Tabs.Item>
        <Tabs.Item disabled={true} title="Disabled">
          Disabled content
        </Tabs.Item>
      </Tabs.Group>
    </AppPage>
  );
}